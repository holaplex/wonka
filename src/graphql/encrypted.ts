import {
  nonNull,
  inputObjectType,
  mutationField,
  arg,
  objectType,
} from 'nexus';
import { YogaInitialContext } from 'graphql-yoga';

import { decryptEncodedPayload } from '../lib/cryptography/utils.js';

export const EncryptedMessageResult = objectType({
  name: 'EncryptedMessageResult',
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
  definition(t) {
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
export const AuthenticatedMutation = mutationField('authenticatedMutation', {
  type: 'EncryptedMessageResult',
  args: {
    encryptedMessage: nonNull(
      arg({
        type: 'EncryptedMessage',
      }),
    ),
  },
  async resolve(_, { encryptedMessage }) {
    return {
      message: decryptEncodedPayload(encryptedMessage),
    };
  },
});
