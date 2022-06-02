"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCollection = void 0;
const accounts_1 = require("../helpers/accounts");
const constants_1 = require("../helpers/constants");
const anchor = __importStar(require("@project-serum/anchor"));
const transactions_1 = require("../helpers/transactions");
const loglevel_1 = __importDefault(require("loglevel"));
async function removeCollection(walletKeyPair, anchorProgram, candyMachineAddress) {
    const wallet = new anchor.Wallet(walletKeyPair);
    const signers = [walletKeyPair];
    const [collectionPDAPubkey] = await (0, accounts_1.getCollectionPDA)(candyMachineAddress);
    const collectionPDAAccount = await anchorProgram.provider.connection.getAccountInfo(collectionPDAPubkey);
    if (!collectionPDAAccount) {
        throw new Error('Candy machine does not have a collection associated with it. You can add a collection using the set_collection command.');
    }
    const collectionMint = (await anchorProgram.account.collectionPda.fetch(collectionPDAPubkey));
    const mint = collectionMint.mint;
    const metadataPubkey = await (0, accounts_1.getMetadata)(mint);
    const [collectionAuthorityRecordPubkey] = await (0, accounts_1.getCollectionAuthorityRecordPDA)(mint, collectionPDAPubkey);
    loglevel_1.default.info('Candy machine address: ', candyMachineAddress.toBase58());
    loglevel_1.default.info('Authority address: ', wallet.publicKey.toBase58());
    loglevel_1.default.info('Collection PDA address: ', collectionPDAPubkey.toBase58());
    loglevel_1.default.info('Metadata address: ', metadataPubkey.toBase58());
    loglevel_1.default.info('Mint address: ', mint.toBase58());
    loglevel_1.default.info('Collection authority record address: ', collectionAuthorityRecordPubkey.toBase58());
    const instructions = [
        await anchorProgram.instruction.removeCollection({
            accounts: {
                candyMachine: candyMachineAddress,
                authority: wallet.publicKey,
                collectionPda: collectionPDAPubkey,
                metadata: metadataPubkey,
                mint: mint,
                collectionAuthorityRecord: collectionAuthorityRecordPubkey,
                tokenMetadataProgram: constants_1.TOKEN_METADATA_PROGRAM_ID,
            },
        }),
    ];
    const txId = (await (0, transactions_1.sendTransactionWithRetryWithKeypair)(anchorProgram.provider.connection, walletKeyPair, instructions, signers)).txid;
    const toReturn = {
        collectionMetadata: metadataPubkey.toBase58(),
        collectionPDA: collectionPDAPubkey.toBase58(),
        txId,
    };
    return toReturn;
}
exports.removeCollection = removeCollection;
