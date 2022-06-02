"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nexus_1 = require("nexus");
const graphql_yoga_1 = require("graphql-yoga");
const createUser_js_1 = require("./graphql/createUser.js");
const path_1 = __importDefault(require("path"));
const dirname = path_1.default.resolve();
const PORT = parseInt(process.env.PORT, 10);
const schema = (0, nexus_1.makeSchema)({
    types: [createUser_js_1.CreateUserMutationResult, createUser_js_1.CreateUserMutation],
    outputs: {
        schema: dirname + '/generated/schema.graphql',
        typegen: dirname + '/generated/typings.ts',
    },
});
const server = (0, graphql_yoga_1.createServer)({ schema, port: PORT });
server.start().then(() => {
    console.log('dirname: ', dirname);
    console.log(`🎸 Ready to rock on: ${PORT}`);
});
