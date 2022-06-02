"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.getOwnersByMintAddresses = void 0;
const constants_1 = require("../helpers/constants");
const loglevel_1 = __importDefault(require("loglevel"));
async function getOwnersByMintAddresses(addresses, connection) {
    const owners = [];
    loglevel_1.default.debug("Recuperation of the owners' addresses");
    for (const address of addresses) {
        owners.push(await getOwnerOfTokenAddress(address, connection));
        await delay(500);
    }
    return owners;
}
exports.getOwnersByMintAddresses = getOwnersByMintAddresses;
async function getOwnerOfTokenAddress(address, connection) {
    try {
        const programAccountsConfig = {
            filters: [
                {
                    dataSize: 165,
                },
                {
                    memcmp: {
                        offset: 0,
                        bytes: address,
                    },
                },
            ],
        };
        const results = await connection.getParsedProgramAccounts(constants_1.TOKEN_PROGRAM_ID, programAccountsConfig);
        const tokenOwner = results.find(token => token.account.data.parsed.info.tokenAmount.amount == 1);
        const ownerAddress = tokenOwner.account.data.parsed.info.owner;
        return ownerAddress;
    }
    catch (error) {
        console.log(`Unable to get owner of: ${address}`);
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.delay = delay;
