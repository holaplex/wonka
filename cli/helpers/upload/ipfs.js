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
exports.ipfsUpload = void 0;
var loglevel_1 = require("loglevel");
var node_fetch_1 = require("node-fetch");
var ipfs_http_client_1 = require("ipfs-http-client");
var path_1 = require("path");
var file_uri_1 = require("./file-uri");
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function ipfsUpload(ipfsCredentials, image, animation, manifestBuffer) {
    return __awaiter(this, void 0, void 0, function () {
        function uploadMedia(media) {
            return __awaiter(this, void 0, void 0, function () {
                var mediaHash, mediaUrl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, uploadToIpfs((0, ipfs_http_client_1.globSource)(media, { recursive: true }))];
                        case 1:
                            mediaHash = _a.sent();
                            loglevel_1["default"].debug('mediaHash:', mediaHash);
                            mediaUrl = "https://ipfs.io/ipfs/".concat(mediaHash);
                            loglevel_1["default"].info('mediaUrl:', mediaUrl);
                            return [4 /*yield*/, (0, node_fetch_1["default"])("https://ipfs.infura.io:5001/api/v0/pin/add?arg=".concat(mediaHash), {
                                    headers: {
                                        Authorization: "Basic ".concat(authIFPS)
                                    },
                                    method: 'POST'
                                })];
                        case 2:
                            _a.sent();
                            loglevel_1["default"].info('uploaded media for file:', media);
                            return [2 /*return*/, mediaUrl];
                    }
                });
            });
        }
        var tokenIfps, ipfs, authIFPS, uploadToIpfs, imageUrl, _a, animationUrl, _b, _c, manifestJson, manifestHash, link;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    tokenIfps = "".concat(ipfsCredentials.projectId, ":").concat(ipfsCredentials.secretKey);
                    ipfs = (0, ipfs_http_client_1.create)('https://ipfs.infura.io:5001');
                    authIFPS = Buffer.from(tokenIfps).toString('base64');
                    uploadToIpfs = function (source) { return __awaiter(_this, void 0, void 0, function () {
                        var cid;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ipfs.add(source)["catch"]()];
                                case 1:
                                    cid = (_a.sent()).cid;
                                    return [2 /*return*/, cid];
                            }
                        });
                    }); };
                    _a = "".concat;
                    return [4 /*yield*/, uploadMedia(image)];
                case 1:
                    imageUrl = _a.apply("", [_d.sent(), "?ext="]).concat(path_1["default"]
                        .extname(image)
                        .replace('.', ''));
                    if (!animation) return [3 /*break*/, 3];
                    _c = "".concat;
                    return [4 /*yield*/, uploadMedia(animation)];
                case 2:
                    _b = _c.apply("", [_d.sent(), "?ext="]).concat(path_1["default"]
                        .extname(animation)
                        .replace('.', ''));
                    return [3 /*break*/, 4];
                case 3:
                    _b = undefined;
                    _d.label = 4;
                case 4:
                    animationUrl = _b;
                    return [4 /*yield*/, (0, file_uri_1.setImageUrlManifest)(manifestBuffer.toString('utf8'), imageUrl, animationUrl)];
                case 5:
                    manifestJson = _d.sent();
                    return [4 /*yield*/, uploadToIpfs(Buffer.from(JSON.stringify(manifestJson)))];
                case 6:
                    manifestHash = _d.sent();
                    return [4 /*yield*/, (0, node_fetch_1["default"])("https://ipfs.infura.io:5001/api/v0/pin/add?arg=".concat(manifestHash), {
                            headers: {
                                Authorization: "Basic ".concat(authIFPS)
                            },
                            method: 'POST'
                        })];
                case 7:
                    _d.sent();
                    return [4 /*yield*/, sleep(500)];
                case 8:
                    _d.sent();
                    link = "https://ipfs.io/ipfs/".concat(manifestHash);
                    loglevel_1["default"].info('uploaded manifest: ', link);
                    return [2 /*return*/, [link, imageUrl, animationUrl]];
            }
        });
    });
}
exports.ipfsUpload = ipfsUpload;
