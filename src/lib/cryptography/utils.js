"use strict";
exports.__esModule = true;
exports.decryptEncodedPayload = void 0;
var tweetnacl_1 = require("tweetnacl");
var bs58_1 = require("bs58");
var util_1 = require("util");
var decryptEncodedPayload = function (_a) {
    var boxedMessage = _a.boxedMessage, clientPublicKey = _a.clientPublicKey, nonce = _a.nonce;
    return new util_1.TextDecoder().decode(tweetnacl_1["default"].box.open(bs58_1["default"].decode(boxedMessage), bs58_1["default"].decode(nonce), bs58_1["default"].decode(clientPublicKey), bs58_1["default"].decode(process.env.SERVER_PRIVATE_KEY)));
};
exports.decryptEncodedPayload = decryptEncodedPayload;
