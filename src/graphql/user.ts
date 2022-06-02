import {
  nonNull,
  objectType,
  inputObjectType,
  mutationField,
  stringArg,
  arg,
} from 'nexus';
import { YogaInitialContext } from 'graphql-yoga';

import { firebaseAdmin } from '../lib/firebase/admin.js';
import { validateFirebaseToken } from '../lib/firebase/utils.js';
import { decryptEncodedPayload } from '../lib/cryptography/utils.js';

const adminAuth = firebaseAdmin.auth();

export const CreateUserMutationResult = objectType({
  name: 'CreateUserMutationResult',
  definition(t) {
    t.nonNull.id('userId');
  },
});

export const CreateUserMutation = mutationField('createUser', {
  type: 'CreateUserMutationResult',
  args: {
    email: nonNull(stringArg()),
    password: nonNull(stringArg()),
    repeatPassword: nonNull(stringArg()),
    displayName: nonNull(stringArg()),
    photoURL: stringArg(),
  },
  async resolve(_, args) {
    const { email, password, repeatPassword, displayName, photoURL } = args;
    if (password !== repeatPassword) {
      throw new Error('Invalid credentials');
    }
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
      photoURL,
    });
    return { userId: userRecord.uid };
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
  type: 'String',
  args: {
    encryptedMessage: nonNull(
      arg({
        type: 'EncryptedMessage',
      }),
    ),
  },
  resolve(_, args, ctx: YogaInitialContext) {
    validateFirebaseToken(
      ctx.request.headers.get('Authorization')?.split(' ')[1],
    );
    const msg = decryptEncodedPayload(args.encryptedMessage);
    return msg;
  },
});
