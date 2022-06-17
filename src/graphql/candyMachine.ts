import { arg, mutationField, nonNull, objectType, stringArg, booleanArg } from 'nexus';
import { YogaInitialContext } from 'graphql-yoga';
import { web3 } from '@project-serum/anchor';
import { uuid as uuidv4 } from 'uuidv4';
import path from 'path';
import fs from 'fs/promises';
import rimraf from 'rimraf';
import { getType } from 'mime';

import { uploadV2 } from '../../cli/commands/upload.js';
import { decryptEncodedPayload } from '../lib/cryptography/utils.js';
import { loadCandyProgramV2 } from '../../cli/helpers/accounts.js';
import {
  getCandyMachineV2ConfigFromPayload,
  parseCollectionMintPubkey,
} from '../../cli/helpers/various.js';
import { StorageType } from '../../cli/helpers/storage-type.js';
import { download } from '../lib/helpers/downloadFile.js';
import { unzip } from '../lib/helpers/unZipFile.js';
import { EXTENSION_JSON } from '../../cli/helpers/constants.js';

const dirname = path.resolve(); // Only works if type=module on newer nodejs versions.

export const CandyMachineUploadResult = objectType({
  name: 'CandyMachineUploadResult',
  description: 'Result from calling candy machine upload',
  definition(t) {
    t.nonNull.string('processId', {
      description: 'Process id handle',
    });
  },
});

export const CandyMachineUploadMutation = mutationField('candyMachineUpload', {
  type: 'CandyMachineUploadResult',
  args: {
    encryptedKeypair: nonNull(
      arg({
        type: 'EncryptedMessage',
      }),
    ),
    config: nonNull(
      arg({
        type: 'JSON',
        description: 'Candy machine configuration',
      }),
    ),
    collectionMint: nonNull(
      stringArg({
        description: 'Collection mint pubkey',
      }),
    ),
    setCollectionMint: nonNull(
      booleanArg({
        description: 'Set collection mint pubkey',
      }),
    ),
    filesZipUrl: nonNull(
      stringArg({
        description: 'Zip file url with the assets',
      }),
    ),
  },
  async resolve(_, args, ctx: YogaInitialContext) {
    const { collectionMint: collectionMintParam, setCollectionMint, filesZipUrl, config } = args;
    const collectionMint = new web3.PublicKey(collectionMintParam);
    const processId = uuidv4();

    const env = process.env.SOLANA_ENV!;

    const keyPairBytes = JSON.parse(
      decryptEncodedPayload(args.encryptedKeypair),
    ) as number[];

    const walletKeyPair = web3.Keypair.fromSecretKey(
      Uint8Array.from(keyPairBytes),
    );

    const anchorProgram = await loadCandyProgramV2(
      walletKeyPair,
      env,
      process.env.RPC_URL!,
    );


    const {
      storage,
      nftStorageKey,
      nftStorageGateway,
      ipfsInfuraProjectId,
      number,
      ipfsInfuraSecret,
      pinataJwt,
      pinataGateway,
      arweaveJwk,
      awsS3Bucket,
      retainAuthority,
      mutable,
      batchSize,
      price,
      splToken,
      treasuryWallet,
      gatekeeper,
      endSettings,
      hiddenSettings,
      whitelistMintSettings,
      goLiveDate,
      uuid,
    } = await getCandyMachineV2ConfigFromPayload(
      walletKeyPair,
      anchorProgram,
      config,
    );

    if (storage === StorageType.ArweaveSol && env !== 'mainnet-beta') {
      console.log(
        'WARNING: On Devnet, the arweave-sol storage option only stores your files for 1 week. Please upload via Mainnet Beta for your final collection.',
      );
    }

    if (storage === StorageType.ArweaveBundle && env !== 'mainnet-beta') {
      throw new Error(
        'The arweave-bundle storage option only works on mainnet because it requires spending real AR tokens. For devnet, please set the --storage option to "aws" or "ipfs"\n',
      );
    }

    if (storage === StorageType.Arweave) {
      console.warn(
        'WARNING: The "arweave" storage option will be going away soon. Please migrate to arweave-bundle or arweave-sol for mainnet.\n',
      );
    }

    if (storage === StorageType.ArweaveBundle && !arweaveJwk) {
      throw new Error(
        'Path to Arweave JWK wallet file (--arweave-jwk) must be provided when using arweave-bundle',
      );
    }

    if (
      storage === StorageType.Ipfs &&
      (!ipfsInfuraProjectId || !ipfsInfuraSecret)
    ) {
      throw new Error(
        'IPFS selected as storage option but Infura project id or secret key were not provided.',
      );
    }

    if (storage === StorageType.Aws && !awsS3Bucket) {
      throw new Error(
        'aws selected as storage option but existing bucket name (--aws-s3-bucket) not provided.',
      );
    }

    if (!Object.values(StorageType).includes(storage)) {
      throw new Error(
        `Storage option must either be ${Object.values(StorageType).join(
          ', ',
        )}. Got: ${storage}`,
      );
    }

    const ipfsCredentials = {
      projectId: ipfsInfuraProjectId,
      secretKey: ipfsInfuraSecret,
    };

    let imageFileCount = 0;
    let animationFileCount = 0;
    let jsonFileCount = 0;

    const zipFile = `${dirname}/${processId}/files.zip`;
    await download(filesZipUrl, zipFile);
    const zipFilesDir = `${dirname}/${processId}/files`;
    await unzip(zipFile, zipFilesDir);
    const files = await fs.readdir(zipFilesDir);

    const supportedImageTypes = {
      'image/png': 1,
      'image/gif': 1,
      'image/jpeg': 1,
    };
    const supportedAnimationTypes = {
      'video/mp4': 1,
      'video/quicktime': 1,
      'audio/mpeg': 1,
      'audio/x-flac': 1,
      'audio/wav': 1,
      'model/gltf-binary': 1,
      'text/html': 1,
    };

    const supportedFiles = files.filter((it) => {
      if (supportedImageTypes[getType(it)]) {
        imageFileCount++;
      } else if (supportedAnimationTypes[getType(it)]) {
        animationFileCount++;
      } else if (it.endsWith(EXTENSION_JSON)) {
        jsonFileCount++;
      } else {
        return false;
      }

      return true;
    });

    if (animationFileCount !== 0 && storage === StorageType.Arweave) {
      throw new Error(
        'The "arweave" storage option is incompatible with animation files. Please try again with another storage option using `--storage <option>`.',
      );
    }

    if (animationFileCount !== 0 && animationFileCount !== jsonFileCount) {
      throw new Error(
        `number of animation files (${animationFileCount}) is different than the number of json files (${jsonFileCount})`,
      );
    } else if (imageFileCount !== jsonFileCount) {
      throw new Error(
        `number of img files (${imageFileCount}) is different than the number of json files (${jsonFileCount})`,
      );
    }

    const elemCount = number ? number : imageFileCount;
    if (elemCount < imageFileCount) {
      throw new Error(
        `max number (${elemCount}) cannot be smaller than the number of images in the source folder (${imageFileCount})`,
      );
    }

    const collectionMintPubkey = await parseCollectionMintPubkey(
      collectionMint,
      anchorProgram.provider.connection,
      walletKeyPair,
    );

    try {
      await uploadV2({
        files: supportedFiles,
        cacheName: processId,
        env: process.env.RPC_URL! as any,
        totalNFTs: elemCount,
        gatekeeper,
        storage,
        retainAuthority,
        mutable,
        nftStorageKey,
        nftStorageGateway,
        ipfsCredentials,
        pinataJwt,
        pinataGateway,
        awsS3Bucket,
        batchSize,
        price,
        treasuryWallet,
        anchorProgram,
        walletKeyPair,
        splToken,
        endSettings,
        hiddenSettings,
        whitelistMintSettings,
        goLiveDate,
        uuid,
        arweaveJwk,
        rateLimit: 5 /* prob 10 */,
        collectionMintPubkey,
        setCollectionMint,
        rpcUrl: process.env.RPC_URL!,
      });
    } catch (err) {
      throw err;
    }

    return {
      processId,
    };
  },
});
