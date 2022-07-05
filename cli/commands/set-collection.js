"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.setCollection = void 0;
var web3_js_1 = require("@solana/web3.js");
var accounts_1 = require("../helpers/accounts");
var constants_1 = require("../helpers/constants");
var anchor = require("@project-serum/anchor");
var spl_token_1 = require("@solana/spl-token");
var transactions_1 = require("../helpers/transactions");
var mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
var loglevel_1 = require("loglevel");
var various_1 = require("../helpers/various");
function setCollection(walletKeyPair, anchorProgram, candyMachineAddress, collectionMint) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var signers, wallet, instructions, mintPubkey, metadataPubkey, masterEditionPubkey, collectionPDAPubkey, collectionAuthorityRecordPubkey, candyMachine, mint, userTokenAccountAddress, _b, _c, _d, _e, _f, data, _g, _h, txId, toReturn;
        var _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    signers = [walletKeyPair];
                    wallet = new anchor.Wallet(walletKeyPair);
                    instructions = [];
                    return [4 /*yield*/, anchorProgram.account.candyMachine.fetch(candyMachineAddress)];
                case 1:
                    candyMachine = _k.sent();
                    if (!!collectionMint) return [3 /*break*/, 8];
                    mint = anchor.web3.Keypair.generate();
                    mintPubkey = mint.publicKey;
                    return [4 /*yield*/, (0, accounts_1.getMetadata)(mintPubkey)];
                case 2:
                    metadataPubkey = _k.sent();
                    return [4 /*yield*/, (0, accounts_1.getMasterEdition)(mintPubkey)];
                case 3:
                    masterEditionPubkey = _k.sent();
                    return [4 /*yield*/, (0, accounts_1.getCollectionPDA)(candyMachineAddress)];
                case 4:
                    collectionPDAPubkey = (_k.sent())[0];
                    return [4 /*yield*/, (0, accounts_1.getCollectionAuthorityRecordPDA)(mintPubkey, collectionPDAPubkey)];
                case 5:
                    collectionAuthorityRecordPubkey = (_k.sent())[0];
                    signers.push(mint);
                    return [4 /*yield*/, spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, wallet.publicKey)];
                case 6:
                    userTokenAccountAddress = _k.sent();
                    _c = (_b = instructions.push).apply;
                    _d = [instructions];
                    _f = (_e = anchor.web3.SystemProgram).createAccount;
                    _j = {
                        fromPubkey: wallet.publicKey,
                        newAccountPubkey: mintPubkey,
                        space: spl_token_1.MintLayout.span
                    };
                    return [4 /*yield*/, anchorProgram.provider.connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span)];
                case 7:
                    _c.apply(_b, _d.concat([[
                            _f.apply(_e, [(_j.lamports = _k.sent(),
                                    _j.programId = spl_token_1.TOKEN_PROGRAM_ID,
                                    _j)]),
                            spl_token_1.Token.createInitMintInstruction(spl_token_1.TOKEN_PROGRAM_ID, mintPubkey, 0, wallet.publicKey, wallet.publicKey),
                            spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mintPubkey, userTokenAccountAddress, wallet.publicKey, wallet.publicKey),
                            spl_token_1.Token.createMintToInstruction(spl_token_1.TOKEN_PROGRAM_ID, mintPubkey, userTokenAccountAddress, wallet.publicKey, [], 1)
                        ]]));
                    data = new mpl_token_metadata_1.DataV2({
                        symbol: (_a = candyMachine.data.symbol) !== null && _a !== void 0 ? _a : '',
                        name: 'Collection NFT',
                        uri: '',
                        sellerFeeBasisPoints: candyMachine.data.seller_fee_basis_points,
                        creators: [
                            new mpl_token_metadata_1.Creator({
                                address: wallet.publicKey.toBase58(),
                                verified: true,
                                share: 100
                            }),
                        ],
                        collection: null,
                        uses: null
                    });
                    instructions.push.apply(instructions, new mpl_token_metadata_1.CreateMetadataV2({ feePayer: wallet.publicKey }, {
                        metadata: metadataPubkey,
                        metadataData: data,
                        updateAuthority: wallet.publicKey,
                        mint: mintPubkey,
                        mintAuthority: wallet.publicKey
                    }).instructions);
                    instructions.push.apply(instructions, new mpl_token_metadata_1.CreateMasterEditionV3({
                        feePayer: wallet.publicKey
                    }, {
                        edition: masterEditionPubkey,
                        metadata: metadataPubkey,
                        mint: mintPubkey,
                        mintAuthority: wallet.publicKey,
                        updateAuthority: wallet.publicKey,
                        maxSupply: new anchor.BN(0)
                    }).instructions);
                    return [3 /*break*/, 14];
                case 8: return [4 /*yield*/, (0, various_1.parseCollectionMintPubkey)(collectionMint, anchorProgram.provider.connection, walletKeyPair)];
                case 9:
                    mintPubkey = _k.sent();
                    return [4 /*yield*/, (0, accounts_1.getMetadata)(mintPubkey)];
                case 10:
                    metadataPubkey = _k.sent();
                    return [4 /*yield*/, (0, accounts_1.getMasterEdition)(mintPubkey)];
                case 11:
                    masterEditionPubkey = _k.sent();
                    return [4 /*yield*/, (0, accounts_1.getCollectionPDA)(candyMachineAddress)];
                case 12:
                    collectionPDAPubkey = (_k.sent())[0];
                    return [4 /*yield*/, (0, accounts_1.getCollectionAuthorityRecordPDA)(mintPubkey, collectionPDAPubkey)];
                case 13:
                    collectionAuthorityRecordPubkey = (_k.sent())[0];
                    _k.label = 14;
                case 14:
                    _h = (_g = instructions).push;
                    return [4 /*yield*/, anchorProgram.instruction.setCollection({
                            accounts: {
                                candyMachine: candyMachineAddress,
                                authority: wallet.publicKey,
                                collectionPda: collectionPDAPubkey,
                                payer: wallet.publicKey,
                                systemProgram: web3_js_1.SystemProgram.programId,
                                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                                metadata: metadataPubkey,
                                mint: mintPubkey,
                                edition: masterEditionPubkey,
                                collectionAuthorityRecord: collectionAuthorityRecordPubkey,
                                tokenMetadataProgram: constants_1.TOKEN_METADATA_PROGRAM_ID
                            }
                        })];
                case 15:
                    _h.apply(_g, [_k.sent()]);
                    loglevel_1["default"].info('Candy machine address: ', candyMachineAddress.toBase58());
                    loglevel_1["default"].info('Collection metadata address: ', metadataPubkey.toBase58());
                    loglevel_1["default"].info('Collection metadata authority: ', wallet.publicKey.toBase58());
                    loglevel_1["default"].info('Collection master edition address: ', masterEditionPubkey.toBase58());
                    loglevel_1["default"].info('Collection mint address: ', mintPubkey.toBase58());
                    loglevel_1["default"].info('Collection PDA address: ', collectionPDAPubkey.toBase58());
                    loglevel_1["default"].info('Collection authority record address: ', collectionAuthorityRecordPubkey.toBase58());
                    return [4 /*yield*/, (0, transactions_1.sendTransactionWithRetryWithKeypair)(anchorProgram.provider.connection, walletKeyPair, instructions, signers)];
                case 16:
                    txId = (_k.sent()).txid;
                    toReturn = {
                        collectionMetadata: metadataPubkey.toBase58(),
                        collectionPDA: collectionPDAPubkey.toBase58(),
                        txId: txId
                    };
                    return [2 /*return*/, toReturn];
            }
        });
    });
}
exports.setCollection = setCollection;
