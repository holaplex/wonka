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
exports.pinataUpload = void 0;
var loglevel_1 = require("loglevel");
var node_fetch_1 = require("node-fetch");
var form_data_1 = require("form-data");
var fs_1 = require("fs");
var file_uri_1 = require("./file-uri");
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('waiting');
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
function uploadMedia(media, jwt) {
    return __awaiter(this, void 0, void 0, function () {
        var data, res, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = new form_data_1["default"]();
                    data.append('file', fs_1["default"].createReadStream(media));
                    return [4 /*yield*/, (0, node_fetch_1["default"])("https://api.pinata.cloud/pinning/pinFileToIPFS", {
                            headers: {
                                Authorization: "Bearer ".concat(jwt)
                            },
                            method: 'POST',
                            body: data
                        })];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    json = _a.sent();
                    return [2 /*return*/, json.IpfsHash];
            }
        });
    });
}
function pinataUpload(image, animation, manifestBuffer, jwt, gateway) {
    return __awaiter(this, void 0, void 0, function () {
        var gatewayUrl, imageCid, animationCid, animationUrl, mediaUrl, manifestJson, metadataCid, link;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gatewayUrl = gateway ? gateway : "https://ipfs.io";
                    return [4 /*yield*/, uploadMedia(image, jwt)];
                case 1:
                    imageCid = _a.sent();
                    loglevel_1["default"].info('uploaded image: ', "".concat(gatewayUrl, "/ipfs/").concat(imageCid));
                    return [4 /*yield*/, sleep(500)];
                case 2:
                    _a.sent();
                    animationCid = undefined;
                    animationUrl = undefined;
                    if (!animation) return [3 /*break*/, 4];
                    return [4 /*yield*/, uploadMedia(animation, jwt)];
                case 3:
                    animationCid = _a.sent();
                    loglevel_1["default"].info('uploaded image: ', "".concat(gatewayUrl, "/ipfs/").concat(animationCid));
                    _a.label = 4;
                case 4:
                    mediaUrl = "".concat(gatewayUrl, "/ipfs/").concat(imageCid);
                    if (animationCid) {
                        animationUrl = "".concat(gatewayUrl, "/ipfs/").concat(animationCid);
                    }
                    return [4 /*yield*/, (0, file_uri_1.setImageUrlManifest)(manifestBuffer.toString('utf8'), mediaUrl, animationUrl)];
                case 5:
                    manifestJson = _a.sent();
                    fs_1["default"].writeFileSync('tempJson.json', JSON.stringify(manifestJson));
                    return [4 /*yield*/, uploadMedia('tempJson.json', jwt)];
                case 6:
                    metadataCid = _a.sent();
                    return [4 /*yield*/, sleep(500)];
                case 7:
                    _a.sent();
                    link = "".concat(gatewayUrl, "/ipfs/").concat(metadataCid);
                    loglevel_1["default"].info('uploaded manifest: ', link);
                    return [2 /*return*/, [link, mediaUrl, animationUrl]];
            }
        });
    });
}
exports.pinataUpload = pinataUpload;
