import * as anchor from '@project-serum/anchor';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { stat } from 'fs/promises';
import { calculate } from '@metaplex/arweave-cost';
import { ARWEAVE_PAYMENT_WALLET } from '../constants';
import { sendTransactionWithRetryWithKeypair } from '../transactions';
import { Logger } from 'winston';

const ARWEAVE_UPLOAD_ENDPOINT =
  'https://us-central1-metaplex-studios.cloudfunctions.net/uploadFile';

async function fetchAssetCostToStore(logger: Logger | null, fileSizes: number[]) {
  const result = await calculate(fileSizes);
  logger?.debug('Arweave cost estimates:', result);

  return result.solana * anchor.web3.LAMPORTS_PER_SOL;
}

async function upload(logger: Logger | null, data: FormData, manifest, index) {
  logger?.debug(`trying to upload image ${index}: ${manifest.name}`);
  return await (
    await fetch(ARWEAVE_UPLOAD_ENDPOINT, {
      method: 'POST',
      // @ts-ignore
      body: data,
    })
  ).json();
}

function estimateManifestSize(logger: Logger | null, filenames: string[]) {
  const paths = {};

  for (const name of filenames) {
    paths[name] = {
      id: 'artestaC_testsEaEmAGFtestEGtestmMGmgMGAV438',
      ext: path.extname(name).replace('.', ''),
    };
  }

  const manifest = {
    manifest: 'arweave/paths',
    version: '0.1.0',
    paths,
    index: {
      path: 'metadata.json',
    },
  };

  const data = Buffer.from(JSON.stringify(manifest), 'utf8');
  logger?.debug('Estimated manifest size:', data.length);
  return data.length;
}

export async function arweaveUpload(
  logger: Logger | null,
  walletKeyPair,
  anchorProgram,
  env,
  image,
  manifestBuffer, // TODO rename metadataBuffer
  manifest, // TODO rename metadata
  index,
) {
  const imageExt = path.extname(image);
  const fsStat = await stat(image);

  const estimatedManifestSize = estimateManifestSize(logger, [
    `${index}${imageExt}`,
    'metadata.json',
  ]);

  const storageCost = await fetchAssetCostToStore(logger, [
    fsStat.size,
    manifestBuffer.length,
    estimatedManifestSize,
  ]);

  logger?.debug(`lamport cost to store ${image}: ${storageCost}`);

  const instructions = [
    anchor.web3.SystemProgram.transfer({
      fromPubkey: walletKeyPair.publicKey,
      toPubkey: ARWEAVE_PAYMENT_WALLET,
      lamports: Math.round(storageCost),
    }),
  ];

  const tx = await sendTransactionWithRetryWithKeypair(
    anchorProgram.provider.connection,
    walletKeyPair,
    instructions,
    [],
    'confirmed',
  );
  logger?.debug(`solana transaction (${env}) for arweave payment:`, tx);

  const data = new FormData();
  data.append('transaction', tx['txid']);
  data.append('env', env);
  data.append('file[]', fs.createReadStream(image), {
    filename: `${index}${imageExt}`,
    contentType: `image/${imageExt.replace('.', '')}`,
  });
  data.append('file[]', manifestBuffer, 'metadata.json');

  const result = await upload(logger, data, manifest, index);

  const metadataFile = result.messages?.find(
    (m) => m.filename === 'manifest.json',
  );
  const imageFile = result.messages?.find(
    (m) => m.filename === `${index}${imageExt}`,
  );
  if (metadataFile?.transactionId) {
    const link = `https://arweave.net/${metadataFile.transactionId}`;
    const imageLink = `https://arweave.net/${
      imageFile.transactionId
    }?ext=${imageExt.replace('.', '')}`;
    logger?.debug(`File uploaded: ${link}`);
    return [link, imageLink];
  } else {
    // @todo improve
    throw new Error(`No transaction ID for upload: ${index}`);
  }
}
