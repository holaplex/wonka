import { makeSchema } from 'nexus';
import { createServer } from 'graphql-yoga';
import * as user from './graphql/user.js';
import path from 'path';
const dirname = path.resolve();

const PORT = parseInt(process.env!.PORT, 10);

const schema = makeSchema({
  types: [user],
  outputs: {
    schema: dirname + '/generated/schema.graphql',
    typegen: dirname + '/generated/typings.ts',
  },
});

const server = createServer({ schema, port: PORT });

server.start().then(() => {
  console.log(`🎸 Ready to rock on: ${PORT}`);
});
