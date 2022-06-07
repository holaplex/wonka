import { arg, mutationField, nonNull, objectType } from 'nexus';
import { YogaInitialContext } from 'graphql-yoga';
import { web3 } from '@project-serum/anchor';

import { decryptEncodedPayload } from '../lib/cryptography/utils.js';


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
    const keyPairBytes = JSON.parse(
      decryptEncodedPayload(args.encryptedKeypair),
    ) as number[];
    const keyPair = web3.Keypair.fromSecretKey(Uint8Array.from(keyPairBytes));
    return {
        processId: 'null'
    }
  },
});
