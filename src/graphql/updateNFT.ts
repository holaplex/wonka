import { nonNull, mutationField, objectType, stringArg, arg } from 'nexus';
import { YogaInitialContext } from 'graphql-yoga';
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  BundlrOptions,
} from '@metaplex-foundation/js-next';
import { getProcessLogger } from './utils';
import { NftMetadata } from './mintNFT';

import {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  Cluster,
} from '@solana/web3.js';

import base58 from 'bs58';
import { JSONScalar } from './json.scalar.js';
import { fs } from '@nftstorage/metaplex-auth/dist/src/platform.js';

export const UpdateNftResult = objectType({
  name: 'UpdateNftResult',
  description: 'The result for updating an NFT',
  definition(t) {
    t.nonNull.boolean('success', {
      description: 'true if nft update succeeded, false otherwise',
    });
    t.nonNull.string('message', {
      description: 'a descriptive message',
    });
    t.nonNull.string('processId', {
      description: 'process id of the request which can be used to get logs',
    });
    t.string('newUri', {
      description: 'uri of uploaded JSON metadata, if one was uploaded',
    });
  },
});

export const UpdateNft = mutationField('updateNft', {
  type: 'UpdateNftResult',
  args: {
    payer: nonNull(
      stringArg({
        description: 'payer secret key, (base58 encoded string)',
      }),
    ),
    updateAuthority: nonNull(
      stringArg({
        description: 'update authority secret key, (base58 encoded string)',
      }),
    ),
    nftMintId: nonNull(
      stringArg({
        description: 'mint key for the NFT to update (base58 encoded string)',
      }),
    ),
    newUri: stringArg({
      description: 'The nft will be updated with this metadata url',
    }),
    newMetadataJson: arg({
      type: 'NftMetadata',
      description: 'new NFT metadata json',
    }),
    cluster: nonNull(
      stringArg({
        description: 'solana cluster name (i.e. devnet, mainnet-beta, testnet)',
      }),
    ),
  },
  async resolve(_, args, ctx: YogaInitialContext) {
    const { logger, processId } = await getProcessLogger();

    const fail = (message: string, newUri?: string) => {
      return {
        success: false,
        message: message,
        processId: processId,
        newUri: newUri,
      };
    };

    const success = (message: string, newUri?: string) => {
      return {
        success: true,
        message: message,
        processId: processId,
        newUri: newUri,
      };
    };

    if (!args.newUri && !args.newMetadataJson) {
      return fail('Failure: must provide either a newUri or newMetadtaJson');
    }

    let newUri = args.newUri;

    try {
      const connection = new Connection(clusterApiUrl(args.cluster as Cluster));
      const metaplex = new Metaplex(connection);
      const payerKeypairSecret = base58.decode(args.payer);
      const payerKeypair = Keypair.fromSecretKey(payerKeypairSecret);
      const updateAuthoritySecret = base58.decode(args.updateAuthority);
      const updateAuthorityKeypair = Keypair.fromSecretKey(
        updateAuthoritySecret,
      );

      metaplex.use(keypairIdentity(payerKeypair));

      const nftMintIdPubkey = new PublicKey(args.nftMintId);
      const nft = await metaplex.nfts().findByMint(nftMintIdPubkey);

      if (nft.uri === args.newUri) {
        return { message: 'URI already up to date' };
      }

      if (!newUri) {
        const opts: BundlrOptions = {
          address:
            args.cluster === 'devnet' ? 'https://devnet.bundlr.network' : null,
          timeout: 60000,
        };

        metaplex.use(bundlrStorage(opts));
        logger.info('Uploading new metadata json');
        const newMetadata = args.newMetadataJson;
        const { uri: myNewUri } = await metaplex
          .nfts()
          .uploadMetadata(newMetadata);
        logger.info('got new metadata uri: ' + myNewUri);
        newUri = myNewUri;
      }

      const { nft: updatedNft } = await metaplex.nfts().update(nft, {
        uri: newUri,
        updateAuthority: updateAuthorityKeypair,
      });

      if (updatedNft.uri === newUri) {
        return success('Updated nft', newUri);
      } else {
        return fail('updated nft did not have newUri', newUri);
      }
    } catch (e) {
      let message = 'Unknown Error';
      if (e instanceof Error) {
        message = e.message;
      }
      logger.error(message);
      return fail(message, newUri);
    }
  },
});
