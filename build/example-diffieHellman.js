"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const util_1 = require("util");
const crypto_1 = require("crypto");
const nonce = new Uint8Array([...(0, crypto_1.randomBytes)(tweetnacl_1.default.box.nonceLength)]);
const clientKeys = tweetnacl_1.default.box.keyPair();
const serverKeys = tweetnacl_1.default.box.keyPair();
const clientBox = tweetnacl_1.default.box(new util_1.TextEncoder().encode('Hello, World'), nonce, serverKeys.publicKey, clientKeys.secretKey);
new util_1.TextDecoder().decode(tweetnacl_1.default.box.open(clientBox, nonce, clientKeys.publicKey, serverKeys.secretKey)); // ?
