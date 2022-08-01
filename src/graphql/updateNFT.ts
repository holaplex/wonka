import { nonNull, mutationField, objectType, stringArg } from 'nexus';

import { YogaInitialContext } from 'graphql-yoga';

import { Metaplex, keypairIdentity } from '@metaplex-foundation/js-next';

import {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  Cluster,
} from '@solana/web3.js';

import base58 from 'bs58';

export const UpdateNftResult = objectType({
  name: 'UpdateNftResult',
  description: 'The result for updating an NFT',
  definition(t) {
    t.nonNull.string('message', {
      description: '// TODO: what should I return',
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
    cluster: nonNull(
      stringArg({
        description: 'solana cluster name (i.e. devnet, mainnet-beta, testnet)',
      }),
    ),
  },
  async resolve(_, args, ctx: YogaInitialContext) {
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

    const { nft: updatedNft } = await metaplex.nfts().update(nft, {
      uri: args.newUri,
      updateAuthority: updateAuthorityKeypair,
    });

    if (updatedNft.uri === args.newUri) {
      return { message: 'Success: ' + nftMintIdPubkey.toBase58() };
    } else {
      return { message: 'Failure: updated nft did not have newUri' };
    }
  },
});
