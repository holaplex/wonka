import { makeSchema } from 'nexus';
import { createServer } from 'graphql-yoga';

import * as encrypted from './graphql/encrypted.js';
import * as candyMachine from './graphql/candyMachine';


import path from 'path';
const dirname = path.resolve();

const PORT = parseInt(process.env!.PORT, 10);

const schema = makeSchema({
  types: [encrypted, candyMachine],
  outputs: {
    schema: dirname + '/generated/schema.graphql',
    typegen: dirname + '/generated/typings.ts',
  },
});

const server = createServer({ schema, port: PORT });

server.start();
