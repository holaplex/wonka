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
exports.createCandyMachineV2Account = exports.createUpdateMetadataInstruction = exports.createAssociatedTokenAccountInstruction = void 0;
var web3_js_1 = require("@solana/web3.js");
var constants_1 = require("./constants");
var anchor = require("@project-serum/anchor");
function createAssociatedTokenAccountInstruction(associatedTokenAddress, payer, walletAddress, splTokenMintAddress) {
    var keys = [
        {
            pubkey: payer,
            isSigner: true,
            isWritable: true
        },
        {
            pubkey: associatedTokenAddress,
            isSigner: false,
            isWritable: true
        },
        {
            pubkey: walletAddress,
            isSigner: false,
            isWritable: false
        },
        {
            pubkey: splTokenMintAddress,
            isSigner: false,
            isWritable: false
        },
        {
            pubkey: web3_js_1.SystemProgram.programId,
            isSigner: false,
            isWritable: false
        },
        {
            pubkey: constants_1.TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false
        },
        {
            pubkey: web3_js_1.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false
        },
    ];
    return new web3_js_1.TransactionInstruction({
        keys: keys,
        programId: constants_1.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        data: Buffer.from([])
    });
}
exports.createAssociatedTokenAccountInstruction = createAssociatedTokenAccountInstruction;
function createUpdateMetadataInstruction(metadataAccount, payer, txnData) {
    var keys = [
        {
            pubkey: metadataAccount,
            isSigner: false,
            isWritable: true
        },
        {
            pubkey: payer,
            isSigner: true,
            isWritable: false
        },
    ];
    return new web3_js_1.TransactionInstruction({
        keys: keys,
        programId: constants_1.TOKEN_METADATA_PROGRAM_ID,
        data: txnData
    });
}
exports.createUpdateMetadataInstruction = createUpdateMetadataInstruction;
function createCandyMachineV2Account(anchorProgram, candyData, payerWallet, candyAccount) {
    return __awaiter(this, void 0, void 0, function () {
        var size, _a, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    size = constants_1.CONFIG_ARRAY_START_V2 +
                        4 +
                        candyData.itemsAvailable.toNumber() * constants_1.CONFIG_LINE_SIZE_V2 +
                        8 +
                        2 * (Math.floor(candyData.itemsAvailable.toNumber() / 8) + 1);
                    _b = (_a = anchor.web3.SystemProgram).createAccount;
                    _c = {
                        fromPubkey: payerWallet,
                        newAccountPubkey: candyAccount,
                        space: size
                    };
                    return [4 /*yield*/, anchorProgram.provider.connection.getMinimumBalanceForRentExemption(size)];
                case 1: return [2 /*return*/, _b.apply(_a, [(_c.lamports = _d.sent(),
                            _c.programId = constants_1.CANDY_MACHINE_PROGRAM_V2_ID,
                            _c)])];
            }
        });
    });
}
exports.createCandyMachineV2Account = createCandyMachineV2Account;
