"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
exports.upload = exports.getAssetManifest = exports.uploadV2 = void 0;
var cliProgress = require("cli-progress");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var loglevel_1 = require("loglevel");
var accounts_1 = require("../helpers/accounts");
var web3_js_1 = require("@solana/web3.js");
var anchor_1 = require("@project-serum/anchor");
var fs_1 = require("fs");
var promise_pool_1 = require("@supercharge/promise-pool");
var cache_1 = require("../helpers/cache");
var arweave_1 = require("../helpers/upload/arweave");
var arweave_bundle_1 = require("../helpers/upload/arweave-bundle");
var aws_1 = require("../helpers/upload/aws");
var ipfs_1 = require("../helpers/upload/ipfs");
var storage_type_1 = require("../helpers/storage-type");
var various_1 = require("../helpers/various");
var pinata_1 = require("../helpers/upload/pinata");
var set_collection_1 = require("./set-collection");
var nft_storage_1 = require("../helpers/upload/nft-storage");
function uploadV2(_a) {
    var e_1, _b, e_2, _c;
    var _d, _e;
    var files = _a.files, cacheName = _a.cacheName, env = _a.env, totalNFTs = _a.totalNFTs, storage = _a.storage, retainAuthority = _a.retainAuthority, mutable = _a.mutable, nftStorageKey = _a.nftStorageKey, nftStorageGateway = _a.nftStorageGateway, ipfsCredentials = _a.ipfsCredentials, pinataJwt = _a.pinataJwt, pinataGateway = _a.pinataGateway, awsS3Bucket = _a.awsS3Bucket, batchSize = _a.batchSize, price = _a.price, treasuryWallet = _a.treasuryWallet, splToken = _a.splToken, gatekeeper = _a.gatekeeper, goLiveDate = _a.goLiveDate, endSettings = _a.endSettings, whitelistMintSettings = _a.whitelistMintSettings, hiddenSettings = _a.hiddenSettings, uuid = _a.uuid, walletKeyPair = _a.walletKeyPair, anchorProgram = _a.anchorProgram, arweaveJwk = _a.arweaveJwk, rateLimit = _a.rateLimit, collectionMintPubkey = _a.collectionMintPubkey, setCollectionMint = _a.setCollectionMint, rpcUrl = _a.rpcUrl;
    return __awaiter(this, void 0, void 0, function () {
        var savedContent, cacheContent, dedupedAssetKeys, dirname, candyMachine, firstAssetManifest, remainingAccounts, splTokenKey, res, collection, exx_1, uploadedItems, arweaveBundleUploadGenerator, _f, _g, _h, _j, _k, arweaveBundleUploadGenerator_1, arweaveBundleUploadGenerator_1_1, value, cacheKeys, arweavePathManifestLinks, updatedManifests, e_1_1, generator, generator_1, generator_1_1, result, e_2_1, progressBar_1, uploadSuccessful, uploadedItems_1;
        var _this = this;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    savedContent = (0, cache_1.loadCache)(cacheName, env);
                    cacheContent = savedContent || {};
                    if (!cacheContent.program) {
                        cacheContent.program = {};
                    }
                    if (!cacheContent.items) {
                        cacheContent.items = {};
                    }
                    dedupedAssetKeys = getAssetKeysNeedingUpload(cacheContent.items, files);
                    dirname = path_1["default"].dirname(files[0]);
                    candyMachine = cacheContent.program.candyMachine
                        ? new web3_js_1.PublicKey(cacheContent.program.candyMachine)
                        : undefined;
                    if (!!cacheContent.program.uuid) return [3 /*break*/, 8];
                    firstAssetManifest = getAssetManifest(dirname, '0');
                    _l.label = 1;
                case 1:
                    _l.trys.push([1, 6, , 7]);
                    remainingAccounts = [];
                    if (splToken) {
                        splTokenKey = new web3_js_1.PublicKey(splToken);
                        remainingAccounts.push({
                            pubkey: splTokenKey,
                            isWritable: false,
                            isSigner: false
                        });
                    }
                    if (!((_e = (_d = firstAssetManifest.properties) === null || _d === void 0 ? void 0 : _d.creators) === null || _e === void 0 ? void 0 : _e.every(function (creator) { return creator.address !== undefined; }))) {
                        throw new Error('Creator address is missing');
                    }
                    // initialize candy
                    loglevel_1["default"].info("initializing candy machine");
                    return [4 /*yield*/, (0, accounts_1.createCandyMachineV2)(anchorProgram, walletKeyPair, treasuryWallet, splToken, {
                            itemsAvailable: new anchor_1.BN(totalNFTs),
                            uuid: uuid,
                            symbol: firstAssetManifest.symbol,
                            sellerFeeBasisPoints: firstAssetManifest.seller_fee_basis_points,
                            isMutable: mutable,
                            maxSupply: new anchor_1.BN(0),
                            retainAuthority: retainAuthority,
                            gatekeeper: gatekeeper,
                            goLiveDate: goLiveDate,
                            price: price,
                            endSettings: endSettings,
                            whitelistMintSettings: whitelistMintSettings,
                            hiddenSettings: hiddenSettings,
                            creators: firstAssetManifest.properties.creators.map(function (creator) {
                                return {
                                    address: new web3_js_1.PublicKey(creator.address),
                                    verified: true,
                                    share: creator.share
                                };
                            })
                        })];
                case 2:
                    res = _l.sent();
                    cacheContent.program.uuid = res.uuid;
                    cacheContent.program.candyMachine = res.candyMachine.toBase58();
                    candyMachine = res.candyMachine;
                    if (!setCollectionMint) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, set_collection_1.setCollection)(walletKeyPair, anchorProgram, res.candyMachine, collectionMintPubkey)];
                case 3:
                    collection = _l.sent();
                    console.log('Collection: ', collection);
                    cacheContent.program.collection = collection.collectionMetadata;
                    return [3 /*break*/, 5];
                case 4:
                    console.log('No collection set');
                    _l.label = 5;
                case 5:
                    loglevel_1["default"].info("initialized config for a candy machine with publickey: ".concat(res.candyMachine.toBase58()));
                    (0, cache_1.saveCache)(cacheName, env, cacheContent);
                    return [3 /*break*/, 7];
                case 6:
                    exx_1 = _l.sent();
                    loglevel_1["default"].error('Error deploying config to Solana network.', exx_1);
                    throw exx_1;
                case 7: return [3 /*break*/, 9];
                case 8:
                    loglevel_1["default"].info("config for a candy machine with publickey: ".concat(cacheContent.program.candyMachine, " has been already initialized"));
                    _l.label = 9;
                case 9:
                    uploadedItems = Object.values(cacheContent.items).filter(function (f) { return !!f.link; }).length;
                    loglevel_1["default"].info("[".concat(uploadedItems, "] out of [").concat(totalNFTs, "] items have been uploaded"));
                    if (dedupedAssetKeys.length) {
                        loglevel_1["default"].info("Starting upload for [".concat(dedupedAssetKeys.length, "] items, format ").concat(JSON.stringify(dedupedAssetKeys[0])));
                    }
                    if (!dedupedAssetKeys.length) return [3 /*break*/, 44];
                    if (!(storage === storage_type_1.StorageType.ArweaveBundle ||
                        storage === storage_type_1.StorageType.ArweaveSol)) return [3 /*break*/, 28];
                    _f = arweave_bundle_1.makeArweaveBundleUploadGenerator;
                    _g = [storage,
                        dirname,
                        dedupedAssetKeys,
                        env];
                    if (!(storage === storage_type_1.StorageType.ArweaveBundle)) return [3 /*break*/, 11];
                    _k = (_j = JSON).parse;
                    return [4 /*yield*/, (0, promises_1.readFile)(arweaveJwk)];
                case 10:
                    _h = _k.apply(_j, [(_l.sent()).toString()]);
                    return [3 /*break*/, 12];
                case 11:
                    _h = undefined;
                    _l.label = 12;
                case 12:
                    arweaveBundleUploadGenerator = _f.apply(void 0, _g.concat([_h, storage === storage_type_1.StorageType.ArweaveSol ? walletKeyPair : undefined,
                        batchSize,
                        rpcUrl]));
                    _l.label = 13;
                case 13:
                    _l.trys.push([13, 18, 19, 24]);
                    arweaveBundleUploadGenerator_1 = __asyncValues(arweaveBundleUploadGenerator);
                    _l.label = 14;
                case 14: return [4 /*yield*/, arweaveBundleUploadGenerator_1.next()];
                case 15:
                    if (!(arweaveBundleUploadGenerator_1_1 = _l.sent(), !arweaveBundleUploadGenerator_1_1.done)) return [3 /*break*/, 17];
                    value = arweaveBundleUploadGenerator_1_1.value;
                    cacheKeys = value.cacheKeys, arweavePathManifestLinks = value.arweavePathManifestLinks, updatedManifests = value.updatedManifests;
                    updateCacheAfterUpload(cacheContent, cacheKeys, arweavePathManifestLinks, updatedManifests.map(function (m) { return m.name; }));
                    (0, cache_1.saveCache)(cacheName, env, cacheContent);
                    loglevel_1["default"].info('Saved bundle upload result to cache.');
                    _l.label = 16;
                case 16: return [3 /*break*/, 14];
                case 17: return [3 /*break*/, 24];
                case 18:
                    e_1_1 = _l.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 24];
                case 19:
                    _l.trys.push([19, , 22, 23]);
                    if (!(arweaveBundleUploadGenerator_1_1 && !arweaveBundleUploadGenerator_1_1.done && (_b = arweaveBundleUploadGenerator_1["return"]))) return [3 /*break*/, 21];
                    return [4 /*yield*/, _b.call(arweaveBundleUploadGenerator_1)];
                case 20:
                    _l.sent();
                    _l.label = 21;
                case 21: return [3 /*break*/, 23];
                case 22:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 23: return [7 /*endfinally*/];
                case 24:
                    loglevel_1["default"].info('Upload done. Cleaning up...');
                    if (!(storage === storage_type_1.StorageType.ArweaveSol && env !== 'devnet')) return [3 /*break*/, 27];
                    loglevel_1["default"].info('Waiting 5 seconds to check Bundlr balance.');
                    return [4 /*yield*/, (0, various_1.sleep)(5000)];
                case 25:
                    _l.sent();
                    return [4 /*yield*/, (0, arweave_bundle_1.withdrawBundlr)(walletKeyPair)];
                case 26:
                    _l.sent();
                    _l.label = 27;
                case 27: return [3 /*break*/, 43];
                case 28:
                    if (!(storage === storage_type_1.StorageType.NftStorage)) return [3 /*break*/, 41];
                    generator = (0, nft_storage_1.nftStorageUploadGenerator)({
                        dirname: dirname,
                        assets: dedupedAssetKeys,
                        env: env,
                        walletKeyPair: walletKeyPair,
                        nftStorageKey: nftStorageKey,
                        nftStorageGateway: nftStorageGateway,
                        batchSize: batchSize
                    });
                    _l.label = 29;
                case 29:
                    _l.trys.push([29, 34, 35, 40]);
                    generator_1 = __asyncValues(generator);
                    _l.label = 30;
                case 30: return [4 /*yield*/, generator_1.next()];
                case 31:
                    if (!(generator_1_1 = _l.sent(), !generator_1_1.done)) return [3 /*break*/, 33];
                    result = generator_1_1.value;
                    updateCacheAfterUpload(cacheContent, result.assets.map(function (a) { return a.cacheKey; }), result.assets.map(function (a) { return a.metadataJsonLink; }), result.assets.map(function (a) { return a.updatedManifest.name; }));
                    (0, cache_1.saveCache)(cacheName, env, cacheContent);
                    loglevel_1["default"].info('Saved bundle upload result to cache.');
                    _l.label = 32;
                case 32: return [3 /*break*/, 30];
                case 33: return [3 /*break*/, 40];
                case 34:
                    e_2_1 = _l.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 40];
                case 35:
                    _l.trys.push([35, , 38, 39]);
                    if (!(generator_1_1 && !generator_1_1.done && (_c = generator_1["return"]))) return [3 /*break*/, 37];
                    return [4 /*yield*/, _c.call(generator_1)];
                case 36:
                    _l.sent();
                    _l.label = 37;
                case 37: return [3 /*break*/, 39];
                case 38:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 39: return [7 /*endfinally*/];
                case 40: return [3 /*break*/, 43];
                case 41:
                    progressBar_1 = new cliProgress.SingleBar({
                        format: 'Progress: [{bar}] {percentage}% | {value}/{total}'
                    }, cliProgress.Presets.shades_classic);
                    progressBar_1.start(dedupedAssetKeys.length, 0);
                    return [4 /*yield*/, promise_pool_1.PromisePool.withConcurrency(batchSize || 10)["for"](dedupedAssetKeys)
                            .handleError(function (err, asset) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        loglevel_1["default"].error("\nError uploading ".concat(JSON.stringify(asset), " asset (skipping)"), err.message);
                                        return [4 /*yield*/, (0, various_1.sleep)(5000)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .process(function (asset) { return __awaiter(_this, void 0, void 0, function () {
                            var manifest, image, animation, manifestBuffer, link, imageLink, animationLink, _a;
                            var _b, _c, _d, _e;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        manifest = getAssetManifest(dirname, asset.index.includes('json') ? asset.index : "".concat(asset.index, ".json"));
                                        image = path_1["default"].join(dirname, "".concat(manifest.image));
                                        animation = 'animation_url' in manifest
                                            ? path_1["default"].join(dirname, "".concat(manifest.animation_url))
                                            : undefined;
                                        manifestBuffer = Buffer.from(JSON.stringify(manifest));
                                        if (animation &&
                                            (!fs_1["default"].existsSync(animation) || !fs_1["default"].lstatSync(animation).isFile())) {
                                            throw new Error("Missing file for the animation_url specified in ".concat(asset.index, ".json"));
                                        }
                                        _f.label = 1;
                                    case 1:
                                        _f.trys.push([1, , 11, 12]);
                                        _a = storage;
                                        switch (_a) {
                                            case storage_type_1.StorageType.Pinata: return [3 /*break*/, 2];
                                            case storage_type_1.StorageType.Ipfs: return [3 /*break*/, 4];
                                            case storage_type_1.StorageType.Aws: return [3 /*break*/, 6];
                                            case storage_type_1.StorageType.Arweave: return [3 /*break*/, 8];
                                        }
                                        return [3 /*break*/, 8];
                                    case 2: return [4 /*yield*/, (0, pinata_1.pinataUpload)(image, animation, manifestBuffer, pinataJwt, pinataGateway)];
                                    case 3:
                                        _b = _f.sent(), link = _b[0], imageLink = _b[1], animationLink = _b[2];
                                        return [3 /*break*/, 10];
                                    case 4: return [4 /*yield*/, (0, ipfs_1.ipfsUpload)(ipfsCredentials, image, animation, manifestBuffer)];
                                    case 5:
                                        _c = _f.sent(), link = _c[0], imageLink = _c[1], animationLink = _c[2];
                                        return [3 /*break*/, 10];
                                    case 6: return [4 /*yield*/, (0, aws_1.awsUpload)(awsS3Bucket, image, animation, manifestBuffer)];
                                    case 7:
                                        _d = _f.sent(), link = _d[0], imageLink = _d[1], animationLink = _d[2];
                                        return [3 /*break*/, 10];
                                    case 8: return [4 /*yield*/, (0, arweave_1.arweaveUpload)(null, walletKeyPair, anchorProgram, env, image, manifestBuffer, manifest, asset.index)];
                                    case 9:
                                        _e = _f.sent(), link = _e[0], imageLink = _e[1];
                                        _f.label = 10;
                                    case 10:
                                        if (animation ? link && imageLink && animationLink : link && imageLink) {
                                            loglevel_1["default"].debug('Updating cache for ', asset.index);
                                            cacheContent.items[asset.index] = {
                                                link: link,
                                                imageLink: imageLink,
                                                name: manifest.name,
                                                onChain: false
                                            };
                                            (0, cache_1.saveCache)(cacheName, env, cacheContent);
                                        }
                                        return [3 /*break*/, 12];
                                    case 11:
                                        progressBar_1.increment();
                                        return [7 /*endfinally*/];
                                    case 12: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 42:
                    _l.sent();
                    progressBar_1.stop();
                    _l.label = 43;
                case 43:
                    (0, cache_1.saveCache)(cacheName, env, cacheContent);
                    _l.label = 44;
                case 44:
                    uploadSuccessful = true;
                    if (!!hiddenSettings) return [3 /*break*/, 46];
                    return [4 /*yield*/, writeIndices({
                            anchorProgram: anchorProgram,
                            cacheContent: cacheContent,
                            cacheName: cacheName,
                            env: env,
                            candyMachine: candyMachine,
                            walletKeyPair: walletKeyPair,
                            rateLimit: rateLimit
                        })];
                case 45:
                    uploadSuccessful = _l.sent();
                    uploadedItems_1 = Object.values(cacheContent.items).filter(function (f) { return !!f.link; }).length;
                    uploadSuccessful = uploadSuccessful && uploadedItems_1 === totalNFTs;
                    return [3 /*break*/, 47];
                case 46:
                    loglevel_1["default"].info('Skipping upload to chain as this is a hidden Candy Machine');
                    _l.label = 47;
                case 47:
                    console.log("Done. Successful = ".concat(uploadSuccessful, "."));
                    return [2 /*return*/, uploadSuccessful];
            }
        });
    });
}
exports.uploadV2 = uploadV2;
/**
 * From the Cache object & a list of file paths, return a list of asset keys
 * (filenames without extension nor path) that should be uploaded, sorted numerically in ascending order.
 * Assets which should be uploaded either are not present in the Cache object,
 * or do not truthy value for the `link` property.
 */
function getAssetKeysNeedingUpload(items, files) {
    var all = __spreadArray([], new Set(__spreadArray(__spreadArray([], Object.keys(items), true), files.map(function (filePath) { return path_1["default"].basename(filePath); }), true)), true);
    var keyMap = {};
    return all
        .filter(function (k) { return !k.includes('.json'); })
        .reduce(function (acc, assetKey) {
        var _a;
        var ext = path_1["default"].extname(assetKey);
        var key = path_1["default"].basename(assetKey, ext);
        if (!((_a = items[key]) === null || _a === void 0 ? void 0 : _a.link) && !keyMap[key]) {
            keyMap[key] = true;
            acc.push({ mediaExt: ext, index: key });
        }
        return acc;
    }, [])
        .sort(function (a, b) { return Number.parseInt(a.index, 10) - Number.parseInt(b.index, 10); });
}
/**
 * Returns a Manifest from a path and an assetKey
 * Replaces image.ext => index.ext
 * Replaces animation_url.ext => index.ext
 */
function getAssetManifest(dirname, assetKey) {
    var assetIndex = assetKey.includes('.json')
        ? assetKey.substring(0, assetKey.length - 5)
        : assetKey;
    var manifestPath = path_1["default"].join(dirname, "".concat(assetIndex, ".json"));
    var manifest = JSON.parse(fs_1["default"].readFileSync(manifestPath).toString());
    manifest.image = manifest.image.replace('image', assetIndex);
    if ('animation_url' in manifest) {
        manifest.animation_url = manifest.animation_url.replace('animation_url', assetIndex);
    }
    return manifest;
}
exports.getAssetManifest = getAssetManifest;
/**
 * For each asset present in the Cache object, write to the deployed
 * configuration an additional line with the name of the asset and the link
 * to its manifest, if the asset was not already written according to the
 * value of `onChain` property in the Cache object, for said asset.
 */
function writeIndices(_a) {
    var anchorProgram = _a.anchorProgram, cacheContent = _a.cacheContent, cacheName = _a.cacheName, env = _a.env, candyMachine = _a.candyMachine, walletKeyPair = _a.walletKeyPair, rateLimit = _a.rateLimit;
    return __awaiter(this, void 0, void 0, function () {
        var uploadSuccessful, keys, poolArray, allIndicesInSlice, offset, length_1, lineSize, configLines, onChain, index, progressBar, addConfigLines;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    uploadSuccessful = true;
                    keys = Object.keys(cacheContent.items);
                    poolArray = [];
                    allIndicesInSlice = Array.from(Array(keys.length).keys());
                    offset = 0;
                    while (offset < allIndicesInSlice.length) {
                        length_1 = 0;
                        lineSize = 0;
                        configLines = allIndicesInSlice.slice(offset, offset + 16);
                        while (length_1 < 850 &&
                            lineSize < 16 &&
                            configLines[lineSize] !== undefined) {
                            length_1 +=
                                cacheContent.items[keys[configLines[lineSize]]].link.length +
                                    cacheContent.items[keys[configLines[lineSize]]].name.length;
                            if (length_1 < 850)
                                lineSize++;
                        }
                        configLines = allIndicesInSlice.slice(offset, offset + lineSize);
                        offset += lineSize;
                        onChain = configLines.filter(function (i) { var _a; return ((_a = cacheContent.items[keys[i]]) === null || _a === void 0 ? void 0 : _a.onChain) || false; });
                        index = keys[configLines[0]];
                        if (onChain.length != configLines.length) {
                            poolArray.push({ index: index, configLines: configLines });
                        }
                    }
                    loglevel_1["default"].info("Writing all indices in ".concat(poolArray.length, " transactions..."));
                    progressBar = new cliProgress.SingleBar({
                        format: 'Progress: [{bar}] {percentage}% | {value}/{total}'
                    }, cliProgress.Presets.shades_classic);
                    progressBar.start(poolArray.length, 0);
                    addConfigLines = function (_a) {
                        var index = _a.index, configLines = _a.configLines;
                        return __awaiter(_this, void 0, void 0, function () {
                            var response;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, anchorProgram.rpc.addConfigLines(index, configLines.map(function (i) { return ({
                                            uri: cacheContent.items[keys[i]].link,
                                            name: cacheContent.items[keys[i]].name
                                        }); }), {
                                            accounts: {
                                                candyMachine: candyMachine,
                                                authority: walletKeyPair.publicKey
                                            },
                                            signers: [walletKeyPair]
                                        })];
                                    case 1:
                                        response = _b.sent();
                                        loglevel_1["default"].debug(response);
                                        configLines.forEach(function (i) {
                                            cacheContent.items[keys[i]] = __assign(__assign({}, cacheContent.items[keys[i]]), { onChain: true, verifyRun: false });
                                        });
                                        (0, cache_1.saveCache)(cacheName, env, cacheContent);
                                        progressBar.increment();
                                        return [2 /*return*/];
                                }
                            });
                        });
                    };
                    return [4 /*yield*/, promise_pool_1.PromisePool.withConcurrency(rateLimit || 5)["for"](poolArray)
                            .handleError(function (err, _a) {
                            var index = _a.index, configLines = _a.configLines;
                            return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            loglevel_1["default"].error("\nFailed writing indices ".concat(index, "-").concat(keys[configLines[configLines.length - 1]], ": ").concat(err.message));
                                            return [4 /*yield*/, (0, various_1.sleep)(5000)];
                                        case 1:
                                            _b.sent();
                                            uploadSuccessful = false;
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        })
                            .process(function (_a) {
                            var index = _a.index, configLines = _a.configLines;
                            return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, addConfigLines({ index: index, configLines: configLines })];
                                        case 1:
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        })];
                case 1:
                    _b.sent();
                    progressBar.stop();
                    (0, cache_1.saveCache)(cacheName, env, cacheContent);
                    return [2 /*return*/, uploadSuccessful];
            }
        });
    });
}
/**
 * Save the Candy Machine's authority (public key) to the Cache object / file.
 */
function setAuthority(publicKey, cache, cacheName, env) {
    cache.authority = publicKey.toBase58();
    (0, cache_1.saveCache)(cacheName, env, cache);
}
/**
 * Update the Cache object for assets that were uploaded with their matching
 * Manifest link. Also set the `onChain` property to `false` so we know this
 * asset should later be appended to the deployed Candy Machine program's
 * configuration on chain.
 */
function updateCacheAfterUpload(cache, cacheKeys, links, names) {
    cacheKeys.forEach(function (cacheKey, idx) {
        cache.items[cacheKey] = {
            link: links[idx],
            name: names[idx],
            onChain: false
        };
    });
}
function upload(_a) {
    var e_3, _b;
    var _c;
    var files = _a.files, cacheName = _a.cacheName, env = _a.env, keypair = _a.keypair, storage = _a.storage, rpcUrl = _a.rpcUrl, ipfsCredentials = _a.ipfsCredentials, awsS3Bucket = _a.awsS3Bucket, arweaveJwk = _a.arweaveJwk, batchSize = _a.batchSize;
    return __awaiter(this, void 0, void 0, function () {
        var cache, config, dirname, dedupedAssetKeys, walletKeyPair, anchorProgram, arweaveBundleUploadGenerator, _d, _e, _f, _g, _h, arweaveBundleUploadGenerator_2, arweaveBundleUploadGenerator_2_1, value, cacheKeys, arweavePathManifestLinks, updatedManifests, e_3_1, SIZE, tick_1, lastPrinted_1;
        var _this = this;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    cache = (0, cache_1.loadCache)(cacheName, env);
                    if (cache === undefined) {
                        loglevel_1["default"].error('Existing cache not found. To create a new candy machine, please use candy machine v2.');
                        throw new Error('Existing cache not found');
                    }
                    // Make sure config exists in cache
                    if (!((_c = cache.program) === null || _c === void 0 ? void 0 : _c.config)) {
                        loglevel_1["default"].error('existing config account not found in cache. To create a new candy machine, please use candy machine v2.');
                        throw new Error('config account not found in cache');
                    }
                    config = new web3_js_1.PublicKey(cache.program.config);
                    cache.items = cache.items || {};
                    dirname = path_1["default"].dirname(files[0]);
                    dedupedAssetKeys = getAssetKeysNeedingUpload(cache.items, files);
                    walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
                    return [4 /*yield*/, (0, accounts_1.loadCandyProgram)(walletKeyPair, env, rpcUrl)];
                case 1:
                    anchorProgram = _j.sent();
                    if (!dedupedAssetKeys.length) return [3 /*break*/, 20];
                    if (!(storage === storage_type_1.StorageType.ArweaveBundle ||
                        storage === storage_type_1.StorageType.ArweaveSol)) return [3 /*break*/, 17];
                    _d = arweave_bundle_1.makeArweaveBundleUploadGenerator;
                    _e = [storage,
                        dirname,
                        dedupedAssetKeys,
                        env];
                    if (!(storage === storage_type_1.StorageType.ArweaveBundle)) return [3 /*break*/, 3];
                    _h = (_g = JSON).parse;
                    return [4 /*yield*/, (0, promises_1.readFile)(arweaveJwk)];
                case 2:
                    _f = _h.apply(_g, [(_j.sent()).toString()]);
                    return [3 /*break*/, 4];
                case 3:
                    _f = undefined;
                    _j.label = 4;
                case 4:
                    arweaveBundleUploadGenerator = _d.apply(void 0, _e.concat([_f, storage === storage_type_1.StorageType.ArweaveSol ? walletKeyPair : undefined,
                        batchSize]));
                    _j.label = 5;
                case 5:
                    _j.trys.push([5, 10, 11, 16]);
                    arweaveBundleUploadGenerator_2 = __asyncValues(arweaveBundleUploadGenerator);
                    _j.label = 6;
                case 6: return [4 /*yield*/, arweaveBundleUploadGenerator_2.next()];
                case 7:
                    if (!(arweaveBundleUploadGenerator_2_1 = _j.sent(), !arweaveBundleUploadGenerator_2_1.done)) return [3 /*break*/, 9];
                    value = arweaveBundleUploadGenerator_2_1.value;
                    cacheKeys = value.cacheKeys, arweavePathManifestLinks = value.arweavePathManifestLinks, updatedManifests = value.updatedManifests;
                    updateCacheAfterUpload(cache, cacheKeys, arweavePathManifestLinks, updatedManifests.map(function (m) { return m.name; }));
                    (0, cache_1.saveCache)(cacheName, env, cache);
                    loglevel_1["default"].info('Saved bundle upload result to cache.');
                    _j.label = 8;
                case 8: return [3 /*break*/, 6];
                case 9: return [3 /*break*/, 16];
                case 10:
                    e_3_1 = _j.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 16];
                case 11:
                    _j.trys.push([11, , 14, 15]);
                    if (!(arweaveBundleUploadGenerator_2_1 && !arweaveBundleUploadGenerator_2_1.done && (_b = arweaveBundleUploadGenerator_2["return"]))) return [3 /*break*/, 13];
                    return [4 /*yield*/, _b.call(arweaveBundleUploadGenerator_2)];
                case 12:
                    _j.sent();
                    _j.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    if (e_3) throw e_3.error;
                    return [7 /*endfinally*/];
                case 15: return [7 /*endfinally*/];
                case 16:
                    loglevel_1["default"].info('Upload done.');
                    return [3 /*break*/, 19];
                case 17:
                    SIZE = dedupedAssetKeys.length;
                    tick_1 = SIZE / 100;
                    lastPrinted_1 = 0;
                    return [4 /*yield*/, Promise.all((0, various_1.chunks)(Array.from(Array(SIZE).keys()), batchSize || 50).map(function (allIndicesInSlice) { return __awaiter(_this, void 0, void 0, function () {
                            var i, assetKey, image, manifest, animation, manifestBuffer, link, imageLink, animationLink, _a, err_1;
                            var _b, _c, _d;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        i = 0;
                                        _e.label = 1;
                                    case 1:
                                        if (!(i < allIndicesInSlice.length)) return [3 /*break*/, 12];
                                        assetKey = dedupedAssetKeys[i];
                                        image = path_1["default"].join(dirname, "".concat(assetKey.index).concat(assetKey.mediaExt));
                                        manifest = getAssetManifest(dirname, assetKey.index);
                                        animation = undefined;
                                        if ('animation_url' in manifest) {
                                            animation = path_1["default"].join(dirname, "".concat(manifest.animation_url));
                                        }
                                        manifestBuffer = Buffer.from(JSON.stringify(manifest));
                                        if (i >= lastPrinted_1 + tick_1 || i === 0) {
                                            lastPrinted_1 = i;
                                            loglevel_1["default"].info("Processing asset: ".concat(assetKey));
                                        }
                                        link = void 0, imageLink = void 0, animationLink = void 0;
                                        _e.label = 2;
                                    case 2:
                                        _e.trys.push([2, 10, , 11]);
                                        _a = storage;
                                        switch (_a) {
                                            case storage_type_1.StorageType.Ipfs: return [3 /*break*/, 3];
                                            case storage_type_1.StorageType.Aws: return [3 /*break*/, 5];
                                            case storage_type_1.StorageType.Arweave: return [3 /*break*/, 7];
                                        }
                                        return [3 /*break*/, 7];
                                    case 3: return [4 /*yield*/, (0, ipfs_1.ipfsUpload)(ipfsCredentials, image, animation, manifestBuffer)];
                                    case 4:
                                        _b = _e.sent(), link = _b[0], imageLink = _b[1], animationLink = _b[2];
                                        return [3 /*break*/, 9];
                                    case 5: return [4 /*yield*/, (0, aws_1.awsUpload)(awsS3Bucket, image, animation, manifestBuffer)];
                                    case 6:
                                        _c = _e.sent(), link = _c[0], imageLink = _c[1], animationLink = _c[2];
                                        return [3 /*break*/, 9];
                                    case 7: return [4 /*yield*/, (0, arweave_1.arweaveUpload)(null, walletKeyPair, anchorProgram, env, image, manifestBuffer, manifest, i)];
                                    case 8:
                                        _d = _e.sent(), link = _d[0], imageLink = _d[1];
                                        _e.label = 9;
                                    case 9:
                                        if (animation
                                            ? link && imageLink && animationLink
                                            : link && imageLink) {
                                            loglevel_1["default"].debug('Updating cache for ', assetKey);
                                            cache.items[assetKey.index] = {
                                                link: link,
                                                imageLink: imageLink,
                                                name: manifest.name,
                                                onChain: false
                                            };
                                            (0, cache_1.saveCache)(cacheName, env, cache);
                                        }
                                        return [3 /*break*/, 11];
                                    case 10:
                                        err_1 = _e.sent();
                                        loglevel_1["default"].error("Error uploading file ".concat(assetKey), err_1);
                                        throw err_1;
                                    case 11:
                                        i++;
                                        return [3 /*break*/, 1];
                                    case 12: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 18:
                    _j.sent();
                    _j.label = 19;
                case 19:
                    setAuthority(walletKeyPair.publicKey, cache, cacheName, env);
                    return [2 /*return*/, writeIndices({
                            anchorProgram: anchorProgram,
                            cacheContent: cache,
                            cacheName: cacheName,
                            env: env,
                            candyMachine: config,
                            walletKeyPair: walletKeyPair,
                            rateLimit: 10
                        })];
                case 20: return [2 /*return*/];
            }
        });
    });
}
exports.upload = upload;
