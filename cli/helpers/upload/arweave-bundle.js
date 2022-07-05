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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.withdrawBundlr = exports.makeArweaveBundleUploadGenerator = exports.LAMPORTS = void 0;
var cliProgress = require("cli-progress");
var promises_1 = require("fs/promises");
var promise_pool_1 = require("@supercharge/promise-pool");
var path_1 = require("path");
var arweave_1 = require("arweave");
var arbundles_1 = require("arbundles");
var loglevel_1 = require("loglevel");
var storage_type_1 = require("../storage-type");
var mime_1 = require("mime");
var various_1 = require("../various");
var client_1 = require("@bundlr-network/client");
var upload_1 = require("../../commands/upload");
exports.LAMPORTS = 1000000000;
// The limit for the cumulated size of filepairs to include in a single bundle.
// arBundles has a limit of 250MB, we use our own limit way below that to:
// - account for the bundling overhead (tags, headers, ...)
// - lower the risk of having to re-upload voluminous filepairs
// - lower the risk for OOM crashes of the Node.js process
// - provide feedback to the user as the collection is bundles & uploaded progressively
// Change at your own risk.
var BUNDLE_SIZE_BYTE_LIMIT = 50 * 1024 * 1024;
/**
 * Tags to include with every individual transaction.
 */
var BASE_TAGS = [{ name: 'App-Name', value: 'Metaplex Candy Machine' }];
var contentTypeTags = {
    json: { name: 'Content-Type', value: 'application/json' },
    'arweave-manifest': {
        name: 'Content-Type',
        value: 'application/x.arweave-manifest+json'
    }
};
/**
 * Create an Arweave instance with sane defaults.
 */
function getArweave() {
    return new arweave_1["default"]({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
        timeout: 20000,
        logging: false,
        logger: console.log
    });
}
/**
 * Simplistic helper to convert a bytes value to its MB counterpart.
 */
function sizeMB(bytes) {
    var precision = 3;
    var rounder = Math.pow(10, 3);
    return (Math.round((bytes / (1024 * 1024)) * rounder) / rounder).toFixed(precision);
}
/**
 * Create the Arweave Path Manifest from the asset image / manifest
 * pair txIds, helps Arweave Gateways find the files.
 * Instructs arweave gateways to serve metadata.json by default
 * when accessing the transaction.
 * See:
 * - https://github.com/ArweaveTeam/arweave/blob/master/doc/path-manifest-schema.md
 * - https://github.com/metaplex-foundation/metaplex/pull/859#pullrequestreview-805914075
 */
function createArweavePathManifest(manifestTxId, imageTxId, imageType, animationTxId, animationType) {
    var _a;
    var arweavePathManifest = {
        manifest: 'arweave/paths',
        version: '0.1.0',
        paths: (_a = {},
            _a["image".concat(imageType)] = {
                id: imageTxId
            },
            _a['metadata.json'] = {
                id: manifestTxId
            },
            _a),
        index: {
            path: 'metadata.json'
        }
    };
    if (animationTxId) {
        arweavePathManifest.paths["animation".concat(animationType)] = {
            id: animationTxId
        };
    }
    return arweavePathManifest;
}
// The size in bytes of a dummy Arweave Path Manifest.
// Used to account for the size of a file pair manifest, in the computation
// of a bundle range.
var dummyAreaveManifestByteSize = (function () {
    var dummyAreaveManifest = createArweavePathManifest('akBSbAEWTf6xDDnrG_BHKaxXjxoGuBnuhMnoYKUCDZo', 'akBSbAEWTf6xDDnrG_BHKaxXjxoGuBnuhMnoYKUCDZo', '.png', 'akBSbAEWTf6xDDnrG_BHKaxXjxoGuBnuhMnoYKUCDZo', '.mp4');
    return Buffer.byteLength(JSON.stringify(dummyAreaveManifest));
})();
function getFilePairSize(_a) {
    var image = _a.image, animation = _a.animation, manifest = _a.manifest;
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, [image, animation, manifest].reduce(function (accP, file) { return __awaiter(_this, void 0, void 0, function () {
                        var acc, size;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, accP];
                                case 1:
                                    acc = _a.sent();
                                    if (!!file) return [3 /*break*/, 2];
                                    return [2 /*return*/, acc];
                                case 2: return [4 /*yield*/, (0, promises_1.stat)(file)];
                                case 3:
                                    size = (_a.sent()).size;
                                    //Adds the 2kb buffer for the txn header and the 10kb min file upload size for bundlr
                                    return [2 /*return*/, acc + 2000 + Math.max(10000, size)];
                            }
                        });
                    }); }, Promise.resolve(dummyAreaveManifestByteSize))];
                case 1: return [2 /*return*/, _b.sent()];
            }
        });
    });
}
/**
 * From a list of file pairs, compute the BundleRange that should be included
 * in a bundle, consisting of one or multiple image + manifest pairs,
 * according to the size of the files to be included in respect of the
 * BUNDLE_SIZE_LIMIT.
 */
function getBundleRange(filePairs, splitSize) {
    if (splitSize === void 0) { splitSize = false; }
    return __awaiter(this, void 0, void 0, function () {
        var total, count, _i, filePairs_1, filePair, filePairSize, limit;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    total = 0;
                    count = 0;
                    _i = 0, filePairs_1 = filePairs;
                    _a.label = 1;
                case 1:
                    if (!(_i < filePairs_1.length)) return [3 /*break*/, 4];
                    filePair = filePairs_1[_i];
                    return [4 /*yield*/, getFilePairSize(filePair)];
                case 2:
                    filePairSize = _a.sent();
                    limit = splitSize
                        ? BUNDLE_SIZE_BYTE_LIMIT * 2
                        : BUNDLE_SIZE_BYTE_LIMIT;
                    if (total + filePairSize >= limit) {
                        if (count === 0) {
                            throw new Error("Image + Manifest filepair (".concat(filePair.key, ") too big (").concat(sizeMB(filePairSize), "MB) for arBundles size limit of ").concat(sizeMB(BUNDLE_SIZE_BYTE_LIMIT), "MB."));
                        }
                        return [3 /*break*/, 4];
                    }
                    total += filePairSize;
                    count += 1;
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, { count: count, size: total }];
            }
        });
    });
}
var imageTags = __spreadArray([], BASE_TAGS, true);
/**
 * Retrieve a DataItem which will hold the asset's image binary data
 * & represent an individual Arweave transaction which can be signed & bundled.
 */
function getImageDataItem(signer, image, contentType) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, (0, arbundles_1.createData)(image, signer, {
                    tags: imageTags.concat({ name: 'Content-Type', value: contentType })
                })];
        });
    });
}
var manifestTags = __spreadArray(__spreadArray([], BASE_TAGS, true), [contentTypeTags['json']], false);
/**
 * Retrieve a DataItem which will hold the asset's manifest binary data
 * & represent an individual Arweave transaction which can be signed & bundled.
 */
function getManifestDataItem(signer, manifest) {
    return (0, arbundles_1.createData)(JSON.stringify(manifest), signer, { tags: manifestTags });
}
var arweavePathManifestTags = __spreadArray(__spreadArray([], BASE_TAGS, true), [
    contentTypeTags['arweave-manifest'],
], false);
/**
 * Retrieve a DataItem which will hold the Arweave Path Manifest binary data
 * & represent an individual Arweave transaction which can be signed & bundled.
 */
function getArweavePathManifestDataItem(signer, arweavePathManifest) {
    return (0, arbundles_1.createData)(JSON.stringify(arweavePathManifest), signer, {
        tags: arweavePathManifestTags
    });
}
/**
 * Retrieve an asset's manifest from the filesystem & update it with the link
 * to the asset's image/animation link, obtained from signing the asset image/animation DataItem.
 */
function getUpdatedManifest(manifestPath, imageLink, animationLink) {
    return __awaiter(this, void 0, void 0, function () {
        var manifest, _a, _b, originalImage;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, (0, promises_1.readFile)(manifestPath)];
                case 1:
                    manifest = _b.apply(_a, [(_c.sent()).toString()]);
                    originalImage = manifest.image;
                    manifest.image = imageLink;
                    manifest.properties.files.forEach(function (file) {
                        if (file.uri === originalImage)
                            file.uri = imageLink;
                    });
                    if (animationLink) {
                        manifest.animation_url = animationLink;
                    }
                    return [2 /*return*/, manifest];
            }
        });
    });
}
/**
 * Fetches the corresponding filepair and creates a data item if arweave bundle
 * or creates a bundlr transaction if arweave sol, to basically avoid clashing
 * between data item's id
 */
function processFiles(_a) {
    var signer = _a.signer, filePair = _a.filePair, bundlr = _a.bundlr, storageType = _a.storageType;
    return __awaiter(this, void 0, void 0, function () {
        var imageDataItem, animationDataItem, manifestDataItem, arweavePathManifestDataItem, imageContentType, imageBuffer, animationContentType, animationBuffer, imageLink, animationLink, manifest, arweavePathManifest;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    imageContentType = (0, mime_1.getType)(filePair.image);
                    return [4 /*yield*/, (0, promises_1.readFile)(filePair.image)];
                case 1:
                    imageBuffer = _b.sent();
                    if (!(storageType === storage_type_1.StorageType.ArweaveSol)) return [3 /*break*/, 3];
                    //@ts-ignore
                    imageDataItem = bundlr.createTransaction(imageBuffer, {
                        tags: imageTags.concat({
                            name: 'Content-Type',
                            value: imageContentType
                        })
                    });
                    return [4 /*yield*/, imageDataItem.sign()];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 3:
                    if (!(storageType === storage_type_1.StorageType.ArweaveBundle)) return [3 /*break*/, 6];
                    return [4 /*yield*/, getImageDataItem(signer, imageBuffer, imageContentType)];
                case 4:
                    imageDataItem = _b.sent();
                    return [4 /*yield*/, imageDataItem.sign(signer)];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6:
                    animationContentType = undefined;
                    if (!filePair.animation) return [3 /*break*/, 12];
                    animationContentType = (0, mime_1.getType)(filePair.animation);
                    return [4 /*yield*/, (0, promises_1.readFile)(filePair.animation)];
                case 7:
                    animationBuffer = _b.sent();
                    if (!(storageType === storage_type_1.StorageType.ArweaveSol)) return [3 /*break*/, 9];
                    //@ts-ignore
                    animationDataItem = bundlr.createTransaction(animationBuffer, {
                        tags: imageTags.concat({
                            name: 'Content-Type',
                            value: animationContentType
                        })
                    });
                    return [4 /*yield*/, animationDataItem.sign()];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 9:
                    if (!(storageType === storage_type_1.StorageType.ArweaveBundle)) return [3 /*break*/, 12];
                    return [4 /*yield*/, getImageDataItem(signer, animationBuffer, animationContentType)];
                case 10:
                    animationDataItem = _b.sent();
                    return [4 /*yield*/, animationDataItem.sign(signer)];
                case 11:
                    _b.sent();
                    _b.label = 12;
                case 12:
                    imageLink = "https://arweave.net/".concat(imageDataItem.id, "?ext=").concat(path_1["default"]
                        .extname(filePair.image)
                        .replace('.', ''));
                    animationLink = filePair.animation
                        ? "https://arweave.net/".concat(animationDataItem.id, "?ext=").concat(path_1["default"]
                            .extname(filePair.animation)
                            .replace('.', ''))
                        : undefined;
                    return [4 /*yield*/, getUpdatedManifest(filePair.manifest, imageLink, animationLink)];
                case 13:
                    manifest = _b.sent();
                    if (!(storageType === storage_type_1.StorageType.ArweaveSol)) return [3 /*break*/, 15];
                    //@ts-ignore
                    manifestDataItem = bundlr.createTransaction(JSON.stringify(manifest), {
                        tags: manifestTags
                    });
                    return [4 /*yield*/, manifestDataItem.sign()];
                case 14:
                    _b.sent();
                    return [3 /*break*/, 17];
                case 15:
                    if (!(storageType === storage_type_1.StorageType.ArweaveBundle)) return [3 /*break*/, 17];
                    manifestDataItem = getManifestDataItem(signer, manifest);
                    return [4 /*yield*/, manifestDataItem.sign(signer)];
                case 16:
                    _b.sent();
                    _b.label = 17;
                case 17:
                    arweavePathManifest = createArweavePathManifest(manifestDataItem.id, imageDataItem.id, ".".concat((0, mime_1.getExtension)(imageContentType)), filePair.animation ? animationDataItem.id : undefined, filePair.animation ? ".".concat((0, mime_1.getExtension)(animationContentType)) : undefined);
                    if (!(storageType === storage_type_1.StorageType.ArweaveSol)) return [3 /*break*/, 20];
                    //@ts-ignore
                    arweavePathManifestDataItem = bundlr.createTransaction(JSON.stringify(arweavePathManifest), { tags: arweavePathManifestTags });
                    return [4 /*yield*/, arweavePathManifestDataItem.sign()];
                case 18:
                    _b.sent();
                    return [4 /*yield*/, arweavePathManifestDataItem.sign(signer)];
                case 19:
                    _b.sent();
                    return [3 /*break*/, 22];
                case 20:
                    if (!(storageType === storage_type_1.StorageType.ArweaveBundle)) return [3 /*break*/, 22];
                    arweavePathManifestDataItem = getArweavePathManifestDataItem(signer, arweavePathManifest);
                    return [4 /*yield*/, arweavePathManifestDataItem.sign(signer)];
                case 21:
                    _b.sent();
                    _b.label = 22;
                case 22: return [2 /*return*/, {
                        imageDataItem: imageDataItem,
                        animationDataItem: animationDataItem,
                        manifestDataItem: manifestDataItem,
                        arweavePathManifestDataItem: arweavePathManifestDataItem,
                        manifest: manifest
                    }];
            }
        });
    });
}
/**
 * Initialize the Arweave Bundle Upload Generator.
 * Returns a Generator function that allows to trigger an asynchronous bundle
 * upload to Arweave when calling generator.next().
 * The Arweave Bundle Upload Generator automatically groups assets file pairs
 * into appropriately sized bundles.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
 */
function makeArweaveBundleUploadGenerator(storage, dirname, assets, env, jwk, walletKeyPair, batchSize, rpcUrl) {
    return __asyncGenerator(this, arguments, function makeArweaveBundleUploadGenerator_1() {
        var signer, storageType, arweave, bundlr, filePairs, bytes, cost, bufferCost, currentBalance, _loop_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    storageType = storage;
                    if (storageType === storage_type_1.StorageType.ArweaveSol && !walletKeyPair) {
                        throw new Error('To pay for uploads with SOL, you need to pass a Solana Keypair');
                    }
                    if (storageType === storage_type_1.StorageType.ArweaveBundle && !jwk) {
                        throw new Error('To pay for uploads with AR, you need to pass a Arweave JWK');
                    }
                    if (storageType === storage_type_1.StorageType.ArweaveBundle) {
                        signer = new arbundles_1.signers.ArweaveSigner(jwk);
                    }
                    arweave = getArweave();
                    bundlr = storageType === storage_type_1.StorageType.ArweaveSol
                        ? env === 'mainnet-beta'
                            ? new client_1["default"]('https://node1.bundlr.network', 'solana', walletKeyPair.secretKey, {
                                timeout: 60000,
                                providerUrl: rpcUrl !== null && rpcUrl !== void 0 ? rpcUrl : 'https://api.metaplex.solana.com'
                            })
                            : new client_1["default"]('https://devnet.bundlr.network', 'solana', walletKeyPair.secretKey, {
                                timeout: 60000,
                                providerUrl: 'https://metaplex.devnet.rpcpool.com'
                            })
                        : undefined;
                    loglevel_1["default"].debug('Bundlr type is: ', env);
                    filePairs = assets.map(function (asset) {
                        var manifestPath = path_1["default"].join(dirname, "".concat(asset.index, ".json"));
                        var manifestData = (0, upload_1.getAssetManifest)(dirname, asset.index);
                        return {
                            key: asset.index,
                            image: path_1["default"].join(dirname, "".concat(manifestData.image)),
                            animation: 'animation_url' in manifestData
                                ? path_1["default"].join(dirname, "".concat(manifestData.animation_url))
                                : undefined,
                            manifest: manifestPath
                        };
                    });
                    if (!(storageType === storage_type_1.StorageType.ArweaveSol)) return [3 /*break*/, 6];
                    return [4 /*yield*/, __await(Promise.all(filePairs.map(getFilePairSize)))];
                case 1:
                    bytes = (_a.sent()).reduce(function (a, b) { return a + b; }, 0);
                    return [4 /*yield*/, __await(bundlr.utils.getPrice('solana', bytes))];
                case 2:
                    cost = _a.sent();
                    bufferCost = cost.multipliedBy(3).dividedToIntegerBy(2);
                    loglevel_1["default"].info("".concat(bufferCost.toNumber() / exports.LAMPORTS, " SOL to upload ").concat(sizeMB(bytes), "MB with buffer"));
                    return [4 /*yield*/, __await(bundlr.getLoadedBalance())];
                case 3:
                    currentBalance = _a.sent();
                    if (!currentBalance.lt(bufferCost)) return [3 /*break*/, 5];
                    loglevel_1["default"].info("Current balance ".concat(currentBalance.toNumber() / exports.LAMPORTS, ". Sending fund txn..."));
                    return [4 /*yield*/, __await(bundlr.fund(bufferCost.minus(currentBalance)))];
                case 4:
                    _a.sent();
                    loglevel_1["default"].info("Successfully funded Arweave Bundler, starting upload");
                    return [3 /*break*/, 6];
                case 5:
                    loglevel_1["default"].info("Current balance ".concat(currentBalance.toNumber() / exports.LAMPORTS, " is sufficient."));
                    _a.label = 6;
                case 6:
                    _loop_1 = function () {
                        var _b, count, size, bundleFilePairs, progressBar, _c, cacheKeys, dataItems, arweavePathManifestLinks, updatedManifests, bundlrTransactions, progressBar_1, errored_1, startBundleTime, bundle, endBundleTime, tx;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0: return [4 /*yield*/, __await(getBundleRange(filePairs, storage === storage_type_1.StorageType.ArweaveSol))];
                                case 1:
                                    _b = _d.sent(), count = _b.count, size = _b.size;
                                    loglevel_1["default"].info("Computed Bundle range, including ".concat(count, " file pair(s) totaling ").concat(sizeMB(size), "MB."));
                                    bundleFilePairs = filePairs.splice(0, count);
                                    loglevel_1["default"].info('Processing file groups...');
                                    progressBar = new cliProgress.SingleBar({
                                        format: 'Progress: [{bar}] {percentage}% | {value}/{total}'
                                    }, cliProgress.Presets.shades_classic);
                                    progressBar.start(bundleFilePairs.length, 0);
                                    return [4 /*yield*/, __await(bundleFilePairs.reduce(
                                        // Process a bundle file pair (image + manifest).
                                        // - retrieve image data, put it in a DataItem
                                        // - sign the image DataItem and build the image link from the txId.
                                        // - retrieve & update the asset manifest w/ the image link
                                        // - put the manifest in a DataItem
                                        // - sign the manifest DataItem and build the manifest link form the txId.
                                        // - create the Arweave Path Manifest w/ both asset image + manifest txIds pair.
                                        // - fill the results accumulator
                                        function processBundleFilePair(accP, filePair) {
                                            return __awaiter(this, void 0, void 0, function () {
                                                var acc, _a, imageDataItem, animationDataItem, manifestDataItem, arweavePathManifestDataItem, manifest, arweavePathManifestLink;
                                                return __generator(this, function (_b) {
                                                    switch (_b.label) {
                                                        case 0: return [4 /*yield*/, accP];
                                                        case 1:
                                                            acc = _b.sent();
                                                            loglevel_1["default"].debug('Processing File Pair', filePair.key);
                                                            return [4 /*yield*/, processFiles({ storageType: storageType, signer: signer, bundlr: bundlr, filePair: filePair })];
                                                        case 2:
                                                            _a = _b.sent(), imageDataItem = _a.imageDataItem, animationDataItem = _a.animationDataItem, manifestDataItem = _a.manifestDataItem, arweavePathManifestDataItem = _a.arweavePathManifestDataItem, manifest = _a.manifest;
                                                            arweavePathManifestLink = "https://arweave.net/".concat(manifestDataItem.id);
                                                            acc.cacheKeys.push(filePair.key);
                                                            acc.dataItems.push(imageDataItem, manifestDataItem, arweavePathManifestDataItem);
                                                            if (filePair.animation) {
                                                                acc.dataItems.push(animationDataItem);
                                                            }
                                                            acc.arweavePathManifestLinks.push(arweavePathManifestLink);
                                                            acc.updatedManifests.push(manifest);
                                                            loglevel_1["default"].debug('Processed File Pair', filePair.key);
                                                            progressBar.increment();
                                                            return [2 /*return*/, acc];
                                                    }
                                                });
                                            });
                                        }, Promise.resolve({
                                            cacheKeys: [],
                                            dataItems: [],
                                            arweavePathManifestLinks: [],
                                            updatedManifests: []
                                        })))];
                                case 2:
                                    _c = _d.sent(), cacheKeys = _c.cacheKeys, dataItems = _c.dataItems, arweavePathManifestLinks = _c.arweavePathManifestLinks, updatedManifests = _c.updatedManifests;
                                    progressBar.stop();
                                    if (!(storageType === storage_type_1.StorageType.ArweaveSol)) return [3 /*break*/, 4];
                                    bundlrTransactions = __spreadArray([], dataItems, true);
                                    loglevel_1["default"].info('Uploading bundle via Bundlr... in multiple transactions');
                                    progressBar_1 = new cliProgress.SingleBar({
                                        format: 'Progress: [{bar}] {percentage}% | {value}/{total}'
                                    }, cliProgress.Presets.shades_classic);
                                    progressBar_1.start(bundlrTransactions.length, 0);
                                    errored_1 = false;
                                    return [4 /*yield*/, __await(promise_pool_1.PromisePool.withConcurrency(batchSize || 20)["for"](bundlrTransactions)
                                            .handleError(function (err) { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                if (!errored_1) {
                                                    errored_1 = true;
                                                    loglevel_1["default"].error("\nCould not complete Bundlr tx upload successfully, exiting due to: ", err);
                                                }
                                                throw err;
                                            });
                                        }); })
                                            .process(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                            var attempts, uploadTransaction;
                                            var _this = this;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        attempts = 0;
                                                        uploadTransaction = function () { return __awaiter(_this, void 0, void 0, function () {
                                                            var _this = this;
                                                            return __generator(this, function (_a) {
                                                                switch (_a.label) {
                                                                    case 0: return [4 /*yield*/, tx.upload()["catch"](function (err) { return __awaiter(_this, void 0, void 0, function () {
                                                                            return __generator(this, function (_a) {
                                                                                switch (_a.label) {
                                                                                    case 0:
                                                                                        attempts++;
                                                                                        if (attempts >= 3) {
                                                                                            throw err;
                                                                                        }
                                                                                        loglevel_1["default"].debug("Failed Bundlr tx upload, retrying transaction (attempt: ".concat(attempts, ")"), err);
                                                                                        return [4 /*yield*/, (0, various_1.sleep)(5 * 1000)];
                                                                                    case 1:
                                                                                        _a.sent();
                                                                                        return [4 /*yield*/, uploadTransaction()];
                                                                                    case 2:
                                                                                        _a.sent();
                                                                                        return [2 /*return*/];
                                                                                }
                                                                            });
                                                                        }); })];
                                                                    case 1:
                                                                        _a.sent();
                                                                        return [2 /*return*/];
                                                                }
                                                            });
                                                        }); };
                                                        return [4 /*yield*/, uploadTransaction()];
                                                    case 1:
                                                        _a.sent();
                                                        progressBar_1.increment();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); }))];
                                case 3:
                                    _d.sent();
                                    progressBar_1.stop();
                                    loglevel_1["default"].info('Bundle uploaded!');
                                    _d.label = 4;
                                case 4:
                                    if (!(storageType === storage_type_1.StorageType.ArweaveBundle)) return [3 /*break*/, 9];
                                    startBundleTime = Date.now();
                                    loglevel_1["default"].info('Bundling...');
                                    return [4 /*yield*/, __await((0, arbundles_1.bundleAndSignData)(dataItems, signer))];
                                case 5:
                                    bundle = _d.sent();
                                    endBundleTime = Date.now();
                                    loglevel_1["default"].info("Bundled ".concat(dataItems.length, " data items in ").concat((endBundleTime - startBundleTime) / 1000, "s"));
                                    return [4 /*yield*/, __await(bundle.toTransaction(arweave, jwk))];
                                case 6:
                                    tx = _d.sent();
                                    return [4 /*yield*/, __await(arweave.transactions.sign(tx, jwk))];
                                case 7:
                                    _d.sent();
                                    loglevel_1["default"].info('Uploading bundle via arbundle...');
                                    return [4 /*yield*/, __await(arweave.transactions.post(tx))];
                                case 8:
                                    _d.sent();
                                    loglevel_1["default"].info('Bundle uploaded!', tx.id);
                                    _d.label = 9;
                                case 9: return [4 /*yield*/, __await({ cacheKeys: cacheKeys, arweavePathManifestLinks: arweavePathManifestLinks, updatedManifests: updatedManifests })];
                                case 10: return [4 /*yield*/, _d.sent()];
                                case 11:
                                    _d.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 7;
                case 7:
                    if (!filePairs.length) return [3 /*break*/, 9];
                    return [5 /*yield**/, _loop_1()];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.makeArweaveBundleUploadGenerator = makeArweaveBundleUploadGenerator;
var withdrawBundlr = function (walletKeyPair) { return __awaiter(void 0, void 0, void 0, function () {
    var bundlr, balance, withdrawResponse, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                bundlr = new client_1["default"]('https://node1.bundlr.network', 'solana', walletKeyPair.secretKey);
                return [4 /*yield*/, bundlr.getLoadedBalance()];
            case 1:
                balance = _a.sent();
                if (!balance.minus(5000).lte(0)) return [3 /*break*/, 2];
                loglevel_1["default"].error("Error: Balance in Bundlr node (".concat(balance.dividedBy(exports.LAMPORTS), " SOL) is too low to withdraw."));
                return [3 /*break*/, 6];
            case 2:
                loglevel_1["default"].info("Requesting a withdrawal of ".concat(balance
                    .minus(5000)
                    .dividedBy(exports.LAMPORTS), " SOL from Bundlr..."));
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, bundlr.withdrawBalance(balance.minus(5000))];
            case 4:
                withdrawResponse = _a.sent();
                if (withdrawResponse.status == 200) {
                    loglevel_1["default"].info("Successfully withdrew ".concat(withdrawResponse.data.final / exports.LAMPORTS, " SOL."));
                }
                else if (withdrawResponse.status == 400) {
                    loglevel_1["default"].info(withdrawResponse.data);
                    loglevel_1["default"].info('Withdraw unsucessful. An additional attempt will be made after all files are uploaded.');
                }
                return [3 /*break*/, 6];
            case 5:
                err_1 = _a.sent();
                loglevel_1["default"].error('Error processing withdrawal request. Please try again using the withdraw_bundlr command in our CLI');
                loglevel_1["default"].error('Error: ', err_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.withdrawBundlr = withdrawBundlr;
