"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserMutation = exports.CreateUserMutationResult = void 0;
const nexus_1 = require("nexus");
const uuidv4_1 = require("uuidv4");
exports.CreateUserMutationResult = (0, nexus_1.objectType)({
    name: 'CreateUserMutationResult',
    definition(t) {
        t.id('userId');
    },
});
exports.CreateUserMutation = (0, nexus_1.mutationField)('createUser', {
    type: 'CreateUserMutationResult',
    args: {
        email: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
        password: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
        repeatPassword: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
        displayName: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
        pubKeyDiffieHellman: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
    },
    resolve(_, args) {
        const id = (0, uuidv4_1.uuid)();
        return {
            userId: id,
        };
    },
});
