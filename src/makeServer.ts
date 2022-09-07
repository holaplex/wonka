import { makeSchema } from 'nexus';
import { createServer, YogaLogger } from 'graphql-yoga';
import * as graphqlTypes from './graphql';

import path from 'path';
const dirname = path.resolve();

const PORT = parseInt(process.env!.PORT, 10);

export const makeServer = (
  port = PORT,
  isDev = process.env.APP_ENV! === 'development',
  logger?: YogaLogger,
) => {
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
      isDev: isDev,
    },
    schema,
    port: port,
    https: !isDev,
    logging: !!logger ? logger : true,
  });

  return server;
};
