"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphQLClient = void 0;
const graphql_request_1 = require("graphql-request");
exports.graphQLClient = new graphql_request_1.GraphQLClient(process.env.HASURA_GRAPHQL_ENDPOINT, {
    headers: {
        authorization: `Bearer ${process.env.HASURA_ADMIN_SECRET}`,
    },
});
