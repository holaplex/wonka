import { GraphQLClient } from 'graphql-request';

export const graphQLClient = new GraphQLClient(
  process.env.HASURA_GRAPHQL_ENDPOINT!,
  {
    headers: {
      authorization: `Bearer ${process.env.HASURA_ADMIN_SECRET!}`,
    },
  },
);
