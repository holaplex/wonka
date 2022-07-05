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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
exports.__esModule = true;
exports.nftStorageUploadGenerator = void 0;
var loglevel_1 = require("loglevel");
// import fs from 'fs';
var path_1 = require("path");
var metaplex_auth_1 = require("@nftstorage/metaplex-auth");
var nft_storage_1 = require("nft.storage");
var cliProgress = require("cli-progress");
function nftStorageUploadGenerator(_a) {
    var dirname = _a.dirname, assets = _a.assets, env = _a.env, walletKeyPair = _a.walletKeyPair, nftStorageKey = _a.nftStorageKey, nftStorageGateway = _a.nftStorageGateway, batchSize = _a.batchSize;
    return __asyncGenerator(this, arguments, function nftStorageUploadGenerator_1() {
        var numBatches, batches, uploadCar, _loop_1, i;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // split asset keys into batches, each of which will be bundled into a CAR file and uploaded separately
                    // default to 50 NFTs per "batch" if no batchSize is given.
                    // larger batches require fewer signatures and will be slightly faster overall if everything is sucessful,
                    // but smaller batches will take less time to retry if there's an error during upload.
                    batchSize = batchSize || 50;
                    batchSize = Math.min(batchSize, metaplex_auth_1.NFTBundle.MAX_ENTRIES);
                    numBatches = Math.ceil(assets.length / batchSize);
                    batches = new Array(numBatches)
                        .fill([])
                        .map(function (_, i) { return assets.slice(i * batchSize, (i + 1) * batchSize); });
                    loglevel_1["default"].info("Uploading to nft.storage in ".concat(batches.length, " batches"));
                    uploadCar = function (cid, car, onStoredChunk) { return __awaiter(_this, void 0, void 0, function () {
                        var client, client;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!nftStorageKey) return [3 /*break*/, 1];
                                    client = new nft_storage_1.NFTStorage({ token: nftStorageKey });
                                    return [2 /*return*/, client.storeCar(car, { onStoredChunk: onStoredChunk })];
                                case 1: return [4 /*yield*/, metaplex_auth_1.NFTStorageMetaplexor.withSecretKey(walletKeyPair.secretKey, {
                                        solanaCluster: env,
                                        mintingAgent: 'metaplex/candy-machine-v2-cli'
                                    })];
                                case 2:
                                    client = _a.sent();
                                    return [2 /*return*/, client.storeCar(cid, car, { onStoredChunk: onStoredChunk })];
                            }
                        });
                    }); };
                    _loop_1 = function (i) {
                        var batch, batchNum, bundle, bundled, packProgressBar, _i, batch_1, asset, manifestPath, imagePath, nft, _c, car, cid, totalSize, uploadProgressBar, stored, onStoredChunk, bundleCID;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    batch = batches[i];
                                    batchNum = i + 1;
                                    bundle = new metaplex_auth_1.NFTBundle();
                                    bundled = [];
                                    loglevel_1["default"].debug("Generating bundle #".concat(batchNum, " of ").concat(batches.length));
                                    packProgressBar = new cliProgress.SingleBar({
                                        format: "Generating bundle #".concat(batchNum, ": [{bar}] {percentage}% | {value}/{total}")
                                    }, cliProgress.Presets.shades_classic);
                                    packProgressBar.start(batch.length, 0);
                                    _i = 0, batch_1 = batch;
                                    _d.label = 1;
                                case 1:
                                    if (!(_i < batch_1.length)) return [3 /*break*/, 4];
                                    asset = batch_1[_i];
                                    manifestPath = path_1["default"].join(dirname, "".concat(asset.index, ".json"));
                                    imagePath = path_1["default"].join(dirname, asset.index + asset.mediaExt);
                                    // if animation_url is set to a filepath, that will be picked up by
                                    // bundle.addNFTFromFileSystem below.
                                    loglevel_1["default"].debug("Adding NFT ".concat(asset.index, " to bundle #").concat(batchNum, " from ").concat(manifestPath));
                                    return [4 /*yield*/, __await(bundle.addNFTFromFileSystem(manifestPath, imagePath, {
                                            id: asset.index,
                                            gatewayHost: nftStorageGateway
                                        }))];
                                case 2:
                                    nft = _d.sent();
                                    bundled.push({
                                        cacheKey: asset.index,
                                        metadataJsonLink: nft.metadataGatewayURL,
                                        updatedManifest: nft.metadata
                                    });
                                    packProgressBar.update(bundled.length);
                                    _d.label = 3;
                                case 3:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 4:
                                    packProgressBar.stop();
                                    return [4 /*yield*/, __await(bundle.asCAR())];
                                case 5:
                                    _c = _d.sent(), car = _c.car, cid = _c.cid;
                                    return [4 /*yield*/, __await(bundle.getRawSize())];
                                case 6:
                                    totalSize = _d.sent();
                                    uploadProgressBar = new cliProgress.SingleBar({
                                        format: "Uploading bundle #".concat(batchNum, ": [{bar}] {percentage}%")
                                    }, cliProgress.Presets.shades_classic);
                                    stored = 0;
                                    uploadProgressBar.start(totalSize, stored);
                                    onStoredChunk = function (size) {
                                        stored += size;
                                        uploadProgressBar.update(stored);
                                    };
                                    return [4 /*yield*/, __await(uploadCar(cid, car, onStoredChunk))];
                                case 7:
                                    bundleCID = _d.sent();
                                    uploadProgressBar.stop();
                                    loglevel_1["default"].info("Completed upload for bundle #".concat(batchNum, " of ").concat(batches.length, ". Bundle root CID: ").concat(bundleCID));
                                    return [4 /*yield*/, __await({
                                            assets: bundled
                                        })];
                                case 8: return [4 /*yield*/, _d.sent()];
                                case 9:
                                    _d.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _b.label = 1;
                case 1:
                    if (!(i < batches.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(i)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.nftStorageUploadGenerator = nftStorageUploadGenerator;
