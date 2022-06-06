import {
  nonNull,
  inputObjectType,
  mutationField,
  arg,
  objectType,
} from 'nexus';
import { YogaInitialContext } from 'graphql-yoga';
import { decryptEncodedPayload } from '../lib/cryptography/utils.js';

import { Metaplex, keypairIdentity } from "@metaplex-foundation/js-next";
import { Connection, clusterApiUrl } from "@solana/web3.js";

export const MintNftResult = objectType({
    name: 'MintNftResult',
    description: 'The result for decrypting',
    definition(t) {
      t.nonNull.string('message', {
        description: 'Decrypted message',
      });
    },
  });
  

export const EncryptedMessage = inputObjectType({
  name: 'EncryptedMessage',
  description:
    'This is the input of an encrypted message, using public-key authenticated encryption to Encrypt and decrypt messages between sender and receiver using elliptic curve Diffie-Hellman key exchange.',
  definition (t) {
    t.nonNull.string('boxedMessage', {
      description: 'Base58 Encoded Box',
    });
    t.nonNull.string('nonce', {
      description: 'Base58 Encoded nonce used for boxing the message',
    });
    t.nonNull.string('clientPublicKey', {
      description: 'Base58 Encoded Client public key used to box the message',
    });
  },
});

// This is a placeholder and an example
export const MintNft = mutationField('mintNft', {
  type: 'MintNftResult',
  args: {
    encryptedMessage: nonNull(
      arg({
        type: 'EncryptedMessage',
      }),
    ),
  },
  async resolve (_, args, ctx: YogaInitialContext) {
    const msg = decryptEncodedPayload(args.encryptedMessage);
    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const metaplex = new Metaplex(connection).use(keypairIdentity(wallet));

    const metadataJson = {
      name: "My NFT",
      description: "My description",
      image: "https://arweave.net/123",
    }

    const { uri } = await metaplex.nfts().uploadMetadata(metadataJson);

    const nft = await metaplex.nfts().create({uri});

    return {
        message: nft
    };
  },
});
