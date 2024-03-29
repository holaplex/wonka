import {
  arg,
  mutationField,
  nonNull,
  objectType,
  stringArg,
  booleanArg,
  queryField,
} from 'nexus';
import { YogaInitialContext } from 'graphql-yoga';
import { web3 } from '@project-serum/anchor';
import { uuid as uuidv4, isUuid } from 'uuidv4';
import path from 'path';
import fs from 'fs/promises';
import { getType } from 'mime';
import winston from 'winston';
import rimraf from 'rimraf';
import { uploadV2 } from '../../cli/commands/upload-logged';
import { loadCandyProgramV2 } from '../../cli/helpers/accounts';
import {
  getCandyMachineV2ConfigFromPayload,
  parseCollectionMintPubkey,
} from '../../cli/helpers/various';
import { StorageType } from '../../cli/helpers/storage-type';
import { download } from '../lib/helpers/downloadFile';
import { CACHE_PATH, EXTENSION_JSON } from '../../cli/helpers/constants';
import mkdirp from 'mkdirp';
import base58 from 'bs58';
import retry from 'async-retry';
import {
  keypairIdentity,
  Metaplex,
  toMetaplexFile,
  sol,
  token,
  SplTokenAmount,
} from '@metaplex-foundation/js';
import { nftStorage } from '@metaplex-foundation/js-plugin-nft-storage';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { ammanMockStorage } from '@metaplex-foundation/amman-client';
import exec from 'await-exec';
import { MintInfo, MintLayout } from '@solana/spl-token';
import Axios from 'axios';

const dirname = path.resolve();
const SUPPORTED_MEDIA_FILE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.mp4'];
const NFT_METADATA_FILENAME = '0.json';

// Downloads a zip file from zipUrl and returns the directory where zipUrl was unpacked
const downloadZip = async (
  zipUrl: string,
  processId: string,
): Promise<string> => {
  // Unpack zip file
  const processDir = path.resolve(process.env.TMP_STORAGE_DIR, processId);
  const zipFilesDir = path.resolve(processDir, 'files');
  const zipFile = path.resolve(processDir, 'files.zip');

  const dirExists = await fs
    .stat(processDir)
    .then(() => true)
    .catch(() => false);

  if (!dirExists) {
    await mkdirp(processDir);
    await download(zipUrl, zipFile);
    await exec('7z x ' + zipFile + ` -y -o${zipFilesDir}`);
  } else {
    throw Error('zip dir already exists');
  }

  return zipFilesDir;
};

const keypairFromBase58String = (keypairStr: string): Keypair => {
  const bytes = base58.decode(keypairStr);
  return web3.Keypair.fromSecretKey(Uint8Array.from(bytes));
};

const contentTypeForFileName = (
  fileName: string,
  supportedFileTypes = SUPPORTED_MEDIA_FILE_EXTENSIONS,
): string => {
  const extensionToType = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.mp4': "video/mp4'",
  };

  const extension = fileName.split('.')[-1];
  return extensionToType[extension];
};

const runUploadV2UsingHiddenSettings = async (
  logger: winston.Logger,
  processId: string,
  args: {
    candyMachineKeypair: Keypair;
    collectionMint: string;
    config: any;
    callbackUrl: null | string;
    guid?: string;
    keyPair: string;
    env: string;
    filesZipUrl: string;
    rpc: string;
    setCollectionMint: boolean;
  },
) => {
  const {
    collectionMint: collectionMintParam,
    setCollectionMint,
    filesZipUrl,
    config,
    rpc,
    env,
    keyPair,
  } = args;

  logger.info('Uploading Candy Machine with hidden settings');

  // setup connection and metaplex client
  const walletKeyPair = keypairFromBase58String(keyPair);
  const connection = new Connection(rpc, {
    confirmTransactionInitialTimeout: 5 * 60 * 1000,
  });
  const metaplex = new Metaplex(connection);
  metaplex.use(keypairIdentity(walletKeyPair));

  // NOTE(will, austin): might be preferable to find a way to inject this dependency
  if (env === 'localnet') {
    metaplex.use(ammanMockStorage('amman-mock-storage'));
  } else {
    if (config['storage'] !== 'nft-storage' || !config['nftStorageKey']) {
      const message =
        'hidden settings currently only works with nft storage and requires an nftStorageKey';
      logger.error(message);
      throw Error(message);
    }

    metaplex.use(
      nftStorage({
        token: config['nftStorageKey'],
      }),
    );
  }

  const storageDriver = metaplex.storage();

  // First we need to upload the necessary NFT files from the zip
  logger.info('Downloading Zip: ', filesZipUrl);
  let zipFilesDir: string
  try {
    zipFilesDir = await downloadZip(filesZipUrl, processId);
  } catch(err) {
    logger.error(`Error downloading file zip`, err);
    throw err
  }
  logger.info('Extracted zip to directory: ', zipFilesDir);
  const templateNftPath = path.join(zipFilesDir, NFT_METADATA_FILENAME);
  const templateNftMetadataStr = await fs.readFile(templateNftPath, 'utf-8');
  let templateNftMetadata = JSON.parse(templateNftMetadataStr);
  logger.info(templateNftMetadata);

  // files look like:
  // { uri: "0.png", type: "image/png" },
  // { uri: "0.mp4", type: "video/mp4" },
  const files = templateNftMetadata['properties']['files'];

  for (let nftFile of files) {
    const fileName = nftFile['uri'];
    const filePath = path.join(zipFilesDir, fileName);
    const fileBytes = await fs.readFile(filePath);
    const contentType = contentTypeForFileName(fileName);
    const metaplexFile = toMetaplexFile(fileBytes, fileName, {
      contentType: contentType,
      extension: fileName.split('.')[-1],
    });

    logger.info(`Uploading file: ${metaplexFile.fileName}`)

    let uploadedFileUri: string
    try {
      uploadedFileUri = await storageDriver.upload(metaplexFile);

      logger.info(`File uploaded: ${uploadedFileUri}`)
    } catch(err) {
      logger.error(`upload file failure: ${err}`)
      throw err
    }


    // update the nft metadata with uploaded uri
    nftFile['uri'] = uploadedFileUri;
    if (templateNftMetadata['image'] === fileName) {
      templateNftMetadata['image'] = uploadedFileUri;
    } else if (templateNftMetadata['animation_url'] == fileName) {
      templateNftMetadata['animation_url'] = uploadedFileUri;
    }
  }

  logger.info('Uploading NFT Metadata: \n', templateNftMetadata);
  const nftMetadataUploadedFileUri = await storageDriver.uploadJson(
    templateNftMetadata,
  );

  logger.info(nftMetadataUploadedFileUri);

  // here we need to make a few modifications and type conversions
  // on the config so that the metaplex sdk is happy.

  config['hiddenSettings'] = {
    name: templateNftMetadata['name'],
    uri: nftMetadataUploadedFileUri,
    // all zeroes should be fine since all the NFT's are the same
    // in cases where nfts have different traits we will want to update this
    // to be the hash of a file that specifies the mint order
    hash: new Array(32).fill(0),
  };

  // these fields come in as strings, but we need to transform them to pubkey objects
  const pubkeyFields = [
    'solTreasuryAccount',
    'collection',
    'splTokenAccount',
    'splToken',
  ];

  for (const field of pubkeyFields) {
    if (!!config[field]) {
      logger.info('updating ', field, 'key');
      config[field] = new PublicKey(config[field]);
    }
  }

  config['authority'] = walletKeyPair;
  if (!!config['solTreasuryAccount']) {
    config['price'] = sol(config['price'] as number);
  } else {
    const mintAcct = await connection.getAccountInfo(config['splToken']);
    const mintInfo = MintLayout.decode(mintAcct.data) as MintInfo;
    const price: SplTokenAmount = token(
      config['price'] as number,
      mintInfo.decimals,
    );

    // TODO(will): cleanup the API so we don't need to rename these arbitrarily
    config['tokenMint'] = config['splToken'];
    config['wallet'] = config['splTokenAccount'];
    config['price'] = price;
  }

  if (setCollectionMint) {
    config['collection'] = new PublicKey(collectionMintParam);
  }

  config['candyMachine'] = args.candyMachineKeypair;

  // TODO(will): clarify which configs keys are actually needed
  delete config['storage'];
  delete config['nftStorageKey'];
  delete config['splToken'];
  delete config['splTokenAccount'];

  let candyMachinePubkey: PublicKey | null = null;
  try {
    logger.info('Creating Candy Machine');
    const { candyMachine } = await metaplex
      .candyMachines()
      .create({
        ...config,
        confirmOptions: {
          commitment: 'finalized',
          maxRetries: 3,
        },
      });
    logger.info('Created Candy Machine: ' + candyMachine.address.toBase58());
    candyMachinePubkey = candyMachine.address;
  } catch (err) {
    logger.error('Errored out', err);
    throw err;
  }

  if (!!args.callbackUrl && !!args.guid && !!candyMachinePubkey) {
    logger.info(`Sending post request to Callback URL: ${args.callbackUrl}`);
    const callbackResult = await Axios.post(args.callbackUrl, {
      candyMachineId: candyMachinePubkey.toBase58(),
      creator: walletKeyPair.publicKey.toBase58(),
      guid: args.guid,
    });
    logger.info('Callback Result Status:', callbackResult.status);
  }

  logger.info('Exiting runUploadV2UsingHiddenSettings');
};

const runUploadV2 = async (
  logger: winston.Logger,
  processId: string,
  args: {
    collectionMint: string;
    config: any;
    callbackUrl: null | string;
    guid?: string;
    keyPair: string;
    env: string;
    filesZipUrl: string;
    rpc: string;
    setCollectionMint: boolean;
  },
) => {
  const {
    collectionMint: collectionMintParam,
    setCollectionMint,
    filesZipUrl,
    config,
    rpc,
    env,
    keyPair,
  } = args;

  logger.log('info', 'Before start...');
  const collectionMint = new web3.PublicKey(collectionMintParam);
  await retry(
    async (bail) => {
      try {
        logger.info('Starting...');
        const walletKeyPair = keypairFromBase58String(keyPair);
        const anchorProgram = await loadCandyProgramV2(walletKeyPair, env, rpc);

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
          logger.warn(
            'WARNING: On Devnet, the arweave-sol storage option only stores your files for 1 week. Please upload via Mainnet Beta for your final collection.',
          );
        }

        if (storage === StorageType.ArweaveBundle && env !== 'mainnet-beta') {
          bail(
            new Error(
              'The arweave-bundle storage option only works on mainnet because it requires spending real AR tokens. For devnet, please set the --storage option to "aws" or "ipfs"\n',
            ),
          );
        }

        if (storage === StorageType.Arweave) {
          logger.warn(
            'WARNING: The "arweave" storage option will be going away soon. Please migrate to arweave-bundle or arweave-sol for mainnet.\n',
          );
        }

        if (storage === StorageType.ArweaveBundle && !arweaveJwk) {
          bail(
            new Error(
              'Path to Arweave JWK wallet file (--arweave-jwk) must be provided when using arweave-bundle',
            ),
          );
        }

        if (
          storage === StorageType.Ipfs &&
          (!ipfsInfuraProjectId || !ipfsInfuraSecret)
        ) {
          bail(
            new Error(
              'IPFS selected as storage option but Infura project id or secret key were not provided.',
            ),
          );
        }

        if (storage === StorageType.Aws && !awsS3Bucket) {
          throw new Error(
            'aws selected as storage option but existing bucket name (--aws-s3-bucket) not provided.',
          );
        }

        if (!Object.values(StorageType).includes(storage)) {
          bail(
            new Error(
              `Storage option must either be ${Object.values(StorageType).join(
                ', ',
              )}. Got: ${storage}`,
            ),
          );
        }

        const ipfsCredentials = {
          projectId: ipfsInfuraProjectId,
          secretKey: ipfsInfuraSecret,
        };

        let imageFileCount = 0;
        let animationFileCount = 0;
        let jsonFileCount = 0;

        logger.info('Now Downloading Zip: ', filesZipUrl);
        const zipFilesDir = await downloadZip(filesZipUrl, processId);
        let files = await fs.readdir(zipFilesDir);
        files = files.map((file) => path.join(zipFilesDir, file));

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
          bail(
            new Error(
              'The "arweave" storage option is incompatible with animation files. Please try again with another storage option using `--storage <option>`.',
            ),
          );
        }

        if (animationFileCount !== 0 && animationFileCount !== jsonFileCount) {
          bail(
            new Error(
              `number of animation files (${animationFileCount}) is different than the number of json files (${jsonFileCount})`,
            ),
          );
        } else if (imageFileCount !== jsonFileCount) {
          bail(
            new Error(
              `number of img files (${imageFileCount}) is different than the number of json files (${jsonFileCount})`,
            ),
          );
        }

        const elemCount = number ? number : imageFileCount;
        if (elemCount < imageFileCount) {
          bail(
            new Error(
              `max number (${elemCount}) cannot be smaller than the number of images in the source folder (${imageFileCount})`,
            ),
          );
        }

        if (animationFileCount === 0) {
          logger.info(`Beginning the upload for ${elemCount} (img+json) pairs`);
        } else {
          logger.info(
            `Beginning the upload for ${elemCount} (img+animation+json) sets`,
          );
        }

        const collectionMintPubkey = await parseCollectionMintPubkey(
          collectionMint,
          anchorProgram.provider.connection,
          walletKeyPair,
        );

        logger.info('About to start uploadV2');
        await uploadV2(logger, {
          files: supportedFiles,
          cacheName: processId,
          env: env as 'mainnet-beta' | 'devnet',
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
          rpcUrl: rpc,
          callbackUrl: args.callbackUrl,
          guid: args.guid,
        });
        logger.info('Finished uploadV2');

        return { processId };
      } catch (err) {
        logger.error('Errored out', err);
        throw err;
      }
    },
    {
      retries: 3,
      onRetry(e, attempt) {
        logger.info('Retrying');
        logger.error(e?.message ?? 'UNKNOWN_ERR');
        logger.error(`Retrying... Attempt ${attempt}`);
      },
    },
  );
};

export const CandyMachineUploadResult = objectType({
  name: 'CandyMachineUploadResult',
  description: 'Result from calling candy machine upload',
  definition(t) {
    t.nonNull.string('processId', {
      description: 'Process id handle',
    });
    t.nonNull.string('candyMachineAddress', {
      description: 'the address that will be used to create the candy machine',
    });
  },
});

export const CandyMachineUploadMutation = mutationField('candyMachineUpload', {
  type: 'CandyMachineUploadResult',
  args: {
    keyPair: nonNull(
      stringArg({
        description: 'Wallet keypair',
      }),
    ),
    callbackUrl: stringArg({
      description: 'Candy Machine Creation callback URL',
    }),
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
    guid: stringArg({
      description: 'Campus GUID',
    }),
    rpc: nonNull(
      stringArg({
        description: 'RPC To use, can point to devnet | mainnet',
      }),
    ),
    env: nonNull(
      stringArg({
        description: 'Solana env, either mainnet-beta | devnet | testnet',
      }),
    ),
    useHiddenSettings: nonNull(
      booleanArg({
        default: false,
        description:
          'if set to true, the candy machine config will be modified to use hidden settings',
      }),
    ),
    executeSync: nonNull(
      booleanArg({
        default: false,
        description: 'if set to true, the upload will execute synchronously',
      }),
    ),
  },
  async resolve(_, args, _ctx: YogaInitialContext) {
    const processId = uuidv4();
    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { processId },
      transports: [
        new winston.transports.File({
          filename: `${dirname}/logs/${processId}.txt`,
        }),
      ],
    });
    if (process.env.NODE_ENV !== 'production') {
      logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      );
    }
    if (
      !(await fs
        .stat(CACHE_PATH)
        .then(() => true)
        .catch(() => false))
    ) {
      await fs.mkdir(CACHE_PATH);
    }

    const processTmpStorageDir = path.resolve(
      process.env.TMP_STORAGE_DIR,
      processId,
    );

    const removeStorageDir = async () => {
      logger.info('cleaning up temp storage');
      await new Promise<void>((resolve, reject) => {
        rimraf(processTmpStorageDir, (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    };

    //
    const candyMachineKeypair = Keypair.generate();
    if (args.useHiddenSettings) {
      const uploadPromise = runUploadV2UsingHiddenSettings(logger, processId, {
        ...args,
        candyMachineKeypair: candyMachineKeypair,
      })
        .catch((err) => {
          logger.error('Aborting runUploadV2UsingHiddenSettings due to error');
          logger.error(err);
        })
        .finally(async () => {
          removeStorageDir();
        });

      if (args.executeSync) {
        logger.info('Waiting for runUploadV2UsingHiddenSettings');
        await uploadPromise;
      }
    } else {
      const uploadPromise = runUploadV2(logger, processId, args)
        .catch((err) => {
          logger.error('Aborting runUploadV2 due to error');
          logger.error(err);
        })
        .finally(async () => {
          removeStorageDir();
        });

      if (args.executeSync) {
        logger.info('Waiting for runUploadV2');
        await uploadPromise;
      }
    }

    const candyMachineAddress = candyMachineKeypair.publicKey.toBase58();
    return { processId, candyMachineAddress };
  },
});

export const CandyMachineUploadLogsResult = objectType({
  name: 'CandyMachineUploadLogsResult',
  description: 'Result from calling candy machine upload logs',
  definition(t) {
    t.nonNull.string('processId', {
      description: 'Process id handle',
    });
    t.nonNull.field('logs', {
      type: 'JSON',
    });
  },
});

export const CandyMachineUploadLogsQuery = queryField(
  'candyMachineUploadLogs',
  {
    type: 'CandyMachineUploadLogsResult',
    description: 'Get logs for a candy machine upload process',
    args: {
      processId: nonNull(
        stringArg({
          description: 'Process id handle',
        }),
      ),
    },
    async resolve(_, args, _ctx: YogaInitialContext) {
      const { processId } = args;
      if (!isUuid(processId)) {
        throw new Error('Invalid processId');
      }

      const logsPath = `${dirname}/logs/${processId}.txt`;
      const fileExists = await fs
        .stat(logsPath)
        .then(() => true)
        .catch(() => false);

      if (!fileExists) {
        return {
          processId,
          logs: [{ message: 'Process handle not found (log file not found)' }],
        };
      }
      // Read logs file
      const logFile = await fs.readFile(logsPath, 'utf8');
      const logs = logFile
        .split('\n')
        .map((l) => {
          try {
            const parsed = JSON.parse(l);
            return parsed;
          } catch (e) {
            return null;
          }
        })
        .filter((l) => l !== null);
      return { processId, logs: { entries: logs } };
    },
  },
);
