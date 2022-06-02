import { nonNull, objectType, mutationField, stringArg } from 'nexus';
import { uuid } from 'uuidv4';

export const CreateUserMutationResult = objectType({
  name: 'CreateUserMutationResult',
  definition(t) {
    t.id('userId');
  },
});

export const CreateUserMutation = mutationField('createUser', {
  type: 'CreateUserMutationResult',
  args: {
    email: nonNull(stringArg()),
    password: nonNull(stringArg()),
    repeatPassword: nonNull(stringArg()),
    displayName: nonNull(stringArg()),
    pubKeyDiffieHellman: nonNull(stringArg()),
  },
  resolve(_, args) {
    const id = uuid();
    return {
      userId: id,
    };
  },
});
