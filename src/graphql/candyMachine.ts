import { arg, mutationField, nonNull, objectType } from 'nexus';
import { YogaInitialContext } from 'graphql-yoga';
import { web3 } from '@project-serum/anchor';

import { decryptEncodedPayload } from '../lib/cryptography/utils.js';
import { loadCandyProgramV2 } from '../../cli/helpers/accounts.js';
import { getCandyMachineV2ConfigFromPayload } from '../../cli/helpers/various.js';
import { StorageType } from '../../cli/helpers/storage-type.js';

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
  },
  async resolve(_, args, ctx: YogaInitialContext) {
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

    // READ FROM ARGS
    const config = {} as any;
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

    return {
      processId: 'null',
    };
  },
});
