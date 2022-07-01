import { makeSchema } from 'nexus';
import { createServer } from 'graphql-yoga';
import * as graphqlTypes from './graphql';

import path from 'path';
const dirname = path.resolve();

const PORT = parseInt(process.env!.PORT, 10);

const schema = makeSchema({
  types: [graphqlTypes],
  outputs: {
    schema: `${dirname}/generated/schema.graphql`,
    typegen: `${dirname}/generated/typings.ts`,
  },
});

const server = createServer({
  maskedErrors: {
    handleParseErrors: false,
    handleValidationErrors: false,
  },
  schema,
  port: PORT,
  https: process.env.APP_ENV! !== 'development',
});

server.start();
