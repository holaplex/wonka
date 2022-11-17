import { nonNull, mutationField, objectType, stringArg, arg } from 'nexus';
import { YogaInitialContext } from 'graphql-yoga';

import {
  Connection,
  Keypair,
  PublicKey,
} from '@solana/web3.js';

import base58 from 'bs58';
import { BundlrOptions, bundlrStorage, keypairIdentity, Metaplex, UpdateNftInput } from '@metaplex-foundation/js';
import { WonkaLogger } from '../lib/helpers/logger';

const LOGGER = WonkaLogger.with('updateNFT');

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
      description: 'The nft will be updated with this metadata url. Must provide either a newUri or newMetadtaJson.',
    }),
    newMetadataJson: arg({
      type: 'NftMetadata',
      description: 'new NFT metadata json. Must provide either a newUri or newMetadtaJson.',
    }),
    cluster: nonNull(
      stringArg({
        description: 'solana cluster name (i.e. devnet, mainnet-beta, testnet)',
      }),
    ),
  },
  async resolve(_, args, ctx: YogaInitialContext) {
    const logger = LOGGER.withIdentifier();

    const fail = (message: string, newUri?: string) => {
      logger.error(`Failed to update NFT with error: ${message}`);
      return {
        success: false,
        message: message,
        processId: logger.id,
        newUri: newUri,
      };
    };

    const success = (message: string, newUri?: string) => {
      logger.error(`Updated NFT successfully. New URI: ${newUri}`);
      return {
        success: true,
        message: message,
        processId: logger.id,
        newUri: newUri,
      };
    };

    if ((!args.newUri && !args.newMetadataJson) || (args.newUri && args.newMetadataJson)) {
      return fail('Failure: must provide either a newUri or newMetadtaJson');
    }

    let newUri = args.newUri;

    try {
      const connection = new Connection(process.env.RPC_ENDPOINT);
      const metaplex = new Metaplex(connection);
      const payerKeypairSecret = base58.decode(args.payer);
      const payerKeypair = Keypair.fromSecretKey(payerKeypairSecret);
      const updateAuthoritySecret = base58.decode(args.updateAuthority);
      const updateAuthorityKeypair = Keypair.fromSecretKey(
        updateAuthoritySecret,
      );

      metaplex.use(keypairIdentity(payerKeypair));

      const nftMintIdPubkey = new PublicKey(args.nftMintId);
      const nft = await metaplex.nfts().findByMint({ mintAddress: nftMintIdPubkey });

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
        logger.info('uploading new metadata json');
        const newMetadata = args.newMetadataJson;
        const { uri: myNewUri } = await metaplex
          .nfts()
          .uploadMetadata(newMetadata);
        logger.info('got new metadata uri: ' + myNewUri);
        newUri = myNewUri;
      }

      const updateNftInput: UpdateNftInput = {
        nftOrSft: nft,
        updateAuthority: updateAuthorityKeypair,
        uri: newUri
      }
      await metaplex.nfts().update(updateNftInput);

      logger.info(
        'update complete for ' +
          nft.mint.address.toBase58() +
          ' uri: ' +
          nft.uri,
      );

      if (nft.uri === newUri) {
        return success('Updated nft', newUri);
      } else {
        return fail('updated nft did not have newUri', newUri);
      }
    } catch (e) {
      return fail('Unhandled exception updating NFT.', newUri);
    }
  },
});
