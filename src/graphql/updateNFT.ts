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
    t.nonNull.string('message', {
      description: '// TODO: what should I return',
    });
    t.string('newUri', {
      description: 'uri of uploaded JSON metadata',
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
    if (!args.newUri && !args.newMetadataJson) {
      return {
        message: 'Failure: must provide either a newUri or newMetadtaJson',
      };
    }

    const logger = await getProcessLogger();

    const connection = new Connection(clusterApiUrl(args.cluster as Cluster));
    const metaplex = new Metaplex(connection);
    const payerKeypairSecret = base58.decode(args.payer);
    const payerKeypair = Keypair.fromSecretKey(payerKeypairSecret);
    const updateAuthoritySecret = base58.decode(args.updateAuthority);
    const updateAuthorityKeypair = Keypair.fromSecretKey(updateAuthoritySecret);

    metaplex.use(keypairIdentity(payerKeypair));

    const nftMintIdPubkey = new PublicKey(args.nftMintId);
    const nft = await metaplex.nfts().findByMint(nftMintIdPubkey);

    if (nft.uri === args.newUri) {
      return { message: 'URI already up to date' };
    }

    let newUri = args.newUri;

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
      return {
        message: 'Success: ' + nftMintIdPubkey.toBase58() + ' ' + newUri,
        newUri: newUri,
      };
    } else {
      return {
        message: 'Failure: updated nft did not have newUri',
        newUri: newUri,
      };
    }
  },
});
