import { makeSchema } from 'nexus';
import { createServer } from 'graphql-yoga';
import { CreateUserMutation, CreateUserMutationResult } from './graphql/user.js';
import path from 'path';
const dirname = path.resolve();

const PORT = parseInt(process.env!.PORT, 10);

const schema = makeSchema({
  types: [CreateUserMutationResult, CreateUserMutation],
  outputs: {
    schema: dirname + '/generated/schema.graphql',
    typegen: dirname + '/generated/typings.ts',
  },
});

const server = createServer({ schema, port: PORT });

server.start().then(() => {
  console.log('dirname: ', dirname);
  console.log(`🎸 Ready to rock on: ${PORT}`);
});
