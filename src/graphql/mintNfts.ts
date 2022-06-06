import {
  nonNull,
  inputObjectType,
  mutationField,
  arg,
  objectType,
} from 'nexus';
import { YogaInitialContext } from 'graphql-yoga';
import { decryptEncodedPayload } from '../lib/cryptography/utils.js';

import { Metaplex, keypairIdentity } from '@metaplex-foundation/js-next';
import { Connection, clusterApiUrl, Keypair } from '@solana/web3.js';

export const MintNftResult = objectType({
  name: 'MintNftResult',
  description: 'The result for minting a NFT',
  definition (t) {
    t.nonNull.string('message', {
      description: 'Mint hash of newly minted NFT',
    });
  },
});

export const MintMetadata = inputObjectType({
  name: 'MintMetadata',
  description: 'The NFT metadata JSON',
  definition (t) {
    t.nonNull.string('metadataJson', {
      description: 'NFT metadata JSON',
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

export const MintNft = mutationField('mintNft', {
  type: 'MintNftResult',
  args: {
    encryptedMessage: nonNull(
      arg({
        type: 'EncryptedMessage',
      }),
    ),
    metadataJSON: nonNull(
      arg({
        type: 'MintMetadata',
      }),
    ),
  },
  async resolve (_, args, ctx: YogaInitialContext) {
    const utf8Encode = new TextEncoder();
    const msg = decryptEncodedPayload(args.encryptedMessage);
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    let uri,
      nft,
      wallet = null;

    const clientSecret = msg;

    // Get create wallet from the client secret
    try {
      wallet = Keypair.fromSecretKey(utf8Encode.encode(clientSecret));
    } catch (e) {
      return {
        message: `Error creating wallet from client secret: ${e.message}`,
      };
    }

    // Get a new metaplex object
    const metaplex = new Metaplex(connection).use(keypairIdentity(wallet));

    // Upload NFT Metadata, use metadata from api call, assume NFT Standard format
    try {
      uri = await metaplex.nfts().uploadMetadata(args.metadataJson);
    } catch (e) {
      return {
        message: `Error uploading metadata: ${e.message}`,
      };
    }

    // Create New NFT with the metadata
    try {
      nft = await metaplex.nfts().create({ uri });
    } catch (e) {
      return {
        message: `Error creating NFT: ${e.message}`,
      };
    }

    // Return the NFT mint address
    return {
      message: nft.mint.publicKey.toBase58(),
    };
  },
});
