import { makeSchema } from 'nexus';
import { createServer, YogaLogger } from 'graphql-yoga';
import * as graphqlTypes from './graphql';

import path from 'path';
const dirname = path.resolve();

const PORT = parseInt(process.env!.PORT, 10);

interface ServerOptions {
  port?: number;
  isDev?: boolean;
  logger?: YogaLogger;
}

export const makeServer = (options?: ServerOptions) => {
  const schema = makeSchema({
    types: [graphqlTypes],
    outputs: {
      schema: `${dirname}/generated/schema.graphql`,
      typegen: `${dirname}/generated/typings.ts`,
    },
  });

  const isDev = options?.isDev ?? process.env.APP_ENV! === 'development';
  const server = createServer({
    maskedErrors: {
      handleParseErrors: false,
      handleValidationErrors: false,
      isDev: isDev,
    },
    schema,
    port: options?.port ?? PORT,
    https: !isDev,
    logging: options?.logger ?? true,
  });

  return server;
};
