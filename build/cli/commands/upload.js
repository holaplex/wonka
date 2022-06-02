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
exports.upload = exports.getAssetManifest = exports.uploadV2 = void 0;
const cliProgress = __importStar(require("cli-progress"));
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const loglevel_1 = __importDefault(require("loglevel"));
const accounts_1 = require("../helpers/accounts");
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@project-serum/anchor");
const fs_1 = __importDefault(require("fs"));
const promise_pool_1 = require("@supercharge/promise-pool");
const cache_1 = require("../helpers/cache");
const arweave_1 = require("../helpers/upload/arweave");
const arweave_bundle_1 = require("../helpers/upload/arweave-bundle");
const aws_1 = require("../helpers/upload/aws");
const ipfs_1 = require("../helpers/upload/ipfs");
const storage_type_1 = require("../helpers/storage-type");
const various_1 = require("../helpers/various");
const pinata_1 = require("../helpers/upload/pinata");
const set_collection_1 = require("./set-collection");
const nft_storage_1 = require("../helpers/upload/nft-storage");
async function uploadV2({ files, cacheName, env, totalNFTs, storage, retainAuthority, mutable, nftStorageKey, nftStorageGateway, ipfsCredentials, pinataJwt, pinataGateway, awsS3Bucket, batchSize, price, treasuryWallet, splToken, gatekeeper, goLiveDate, endSettings, whitelistMintSettings, hiddenSettings, uuid, walletKeyPair, anchorProgram, arweaveJwk, rateLimit, collectionMintPubkey, setCollectionMint, rpcUrl, }) {
    var _a, _b;
    const savedContent = (0, cache_1.loadCache)(cacheName, env);
    const cacheContent = savedContent || {};
    if (!cacheContent.program) {
        cacheContent.program = {};
    }
    if (!cacheContent.items) {
        cacheContent.items = {};
    }
    const dedupedAssetKeys = getAssetKeysNeedingUpload(cacheContent.items, files);
    const dirname = path_1.default.dirname(files[0]);
    let candyMachine = cacheContent.program.candyMachine
        ? new web3_js_1.PublicKey(cacheContent.program.candyMachine)
        : undefined;
    if (!cacheContent.program.uuid) {
        const firstAssetManifest = getAssetManifest(dirname, '0');
        try {
            const remainingAccounts = [];
            if (splToken) {
                const splTokenKey = new web3_js_1.PublicKey(splToken);
                remainingAccounts.push({
                    pubkey: splTokenKey,
                    isWritable: false,
                    isSigner: false,
                });
            }
            if (!((_b = (_a = firstAssetManifest.properties) === null || _a === void 0 ? void 0 : _a.creators) === null || _b === void 0 ? void 0 : _b.every(creator => creator.address !== undefined))) {
                throw new Error('Creator address is missing');
            }
            // initialize candy
            loglevel_1.default.info(`initializing candy machine`);
            const res = await (0, accounts_1.createCandyMachineV2)(anchorProgram, walletKeyPair, treasuryWallet, splToken, {
                itemsAvailable: new anchor_1.BN(totalNFTs),
                uuid,
                symbol: firstAssetManifest.symbol,
                sellerFeeBasisPoints: firstAssetManifest.seller_fee_basis_points,
                isMutable: mutable,
                maxSupply: new anchor_1.BN(0),
                retainAuthority: retainAuthority,
                gatekeeper,
                goLiveDate,
                price,
                endSettings,
                whitelistMintSettings,
                hiddenSettings,
                creators: firstAssetManifest.properties.creators.map(creator => {
                    return {
                        address: new web3_js_1.PublicKey(creator.address),
                        verified: true,
                        share: creator.share,
                    };
                }),
            });
            cacheContent.program.uuid = res.uuid;
            cacheContent.program.candyMachine = res.candyMachine.toBase58();
            candyMachine = res.candyMachine;
            if (setCollectionMint) {
                const collection = await (0, set_collection_1.setCollection)(walletKeyPair, anchorProgram, res.candyMachine, collectionMintPubkey);
                console.log('Collection: ', collection);
                cacheContent.program.collection = collection.collectionMetadata;
            }
            else {
                console.log('No collection set');
            }
            loglevel_1.default.info(`initialized config for a candy machine with publickey: ${res.candyMachine.toBase58()}`);
            (0, cache_1.saveCache)(cacheName, env, cacheContent);
        }
        catch (exx) {
            loglevel_1.default.error('Error deploying config to Solana network.', exx);
            throw exx;
        }
    }
    else {
        loglevel_1.default.info(`config for a candy machine with publickey: ${cacheContent.program.candyMachine} has been already initialized`);
    }
    const uploadedItems = Object.values(cacheContent.items).filter((f) => !!f.link).length;
    loglevel_1.default.info(`[${uploadedItems}] out of [${totalNFTs}] items have been uploaded`);
    if (dedupedAssetKeys.length) {
        loglevel_1.default.info(`Starting upload for [${dedupedAssetKeys.length}] items, format ${JSON.stringify(dedupedAssetKeys[0])}`);
    }
    if (dedupedAssetKeys.length) {
        if (storage === storage_type_1.StorageType.ArweaveBundle ||
            storage === storage_type_1.StorageType.ArweaveSol) {
            // Initialize the Arweave Bundle Upload Generator.
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
            const arweaveBundleUploadGenerator = (0, arweave_bundle_1.makeArweaveBundleUploadGenerator)(storage, dirname, dedupedAssetKeys, env, storage === storage_type_1.StorageType.ArweaveBundle
                ? JSON.parse((await (0, promises_1.readFile)(arweaveJwk)).toString())
                : undefined, storage === storage_type_1.StorageType.ArweaveSol ? walletKeyPair : undefined, batchSize, rpcUrl);
            // Loop over every uploaded bundle of asset filepairs (PNG + JSON)
            // and save the results to the Cache object, persist it to the Cache file.
            for await (const value of arweaveBundleUploadGenerator) {
                const { cacheKeys, arweavePathManifestLinks, updatedManifests } = value;
                updateCacheAfterUpload(cacheContent, cacheKeys, arweavePathManifestLinks, updatedManifests.map(m => m.name));
                (0, cache_1.saveCache)(cacheName, env, cacheContent);
                loglevel_1.default.info('Saved bundle upload result to cache.');
            }
            loglevel_1.default.info('Upload done. Cleaning up...');
            if (storage === storage_type_1.StorageType.ArweaveSol && env !== 'devnet') {
                loglevel_1.default.info('Waiting 5 seconds to check Bundlr balance.');
                await (0, various_1.sleep)(5000);
                await (0, arweave_bundle_1.withdrawBundlr)(walletKeyPair);
            }
        }
        else if (storage === storage_type_1.StorageType.NftStorage) {
            const generator = (0, nft_storage_1.nftStorageUploadGenerator)({
                dirname,
                assets: dedupedAssetKeys,
                env,
                walletKeyPair,
                nftStorageKey,
                nftStorageGateway,
                batchSize,
            });
            for await (const result of generator) {
                updateCacheAfterUpload(cacheContent, result.assets.map(a => a.cacheKey), result.assets.map(a => a.metadataJsonLink), result.assets.map(a => a.updatedManifest.name));
                (0, cache_1.saveCache)(cacheName, env, cacheContent);
                loglevel_1.default.info('Saved bundle upload result to cache.');
            }
        }
        else {
            const progressBar = new cliProgress.SingleBar({
                format: 'Progress: [{bar}] {percentage}% | {value}/{total}',
            }, cliProgress.Presets.shades_classic);
            progressBar.start(dedupedAssetKeys.length, 0);
            await promise_pool_1.PromisePool.withConcurrency(batchSize || 10)
                .for(dedupedAssetKeys)
                .handleError(async (err, asset) => {
                loglevel_1.default.error(`\nError uploading ${JSON.stringify(asset)} asset (skipping)`, err.message);
                await (0, various_1.sleep)(5000);
            })
                .process(async (asset) => {
                const manifest = getAssetManifest(dirname, asset.index.includes('json') ? asset.index : `${asset.index}.json`);
                const image = path_1.default.join(dirname, `${manifest.image}`);
                const animation = 'animation_url' in manifest
                    ? path_1.default.join(dirname, `${manifest.animation_url}`)
                    : undefined;
                const manifestBuffer = Buffer.from(JSON.stringify(manifest));
                if (animation &&
                    (!fs_1.default.existsSync(animation) || !fs_1.default.lstatSync(animation).isFile())) {
                    throw new Error(`Missing file for the animation_url specified in ${asset.index}.json`);
                }
                let link, imageLink, animationLink;
                try {
                    switch (storage) {
                        case storage_type_1.StorageType.Pinata:
                            [link, imageLink, animationLink] = await (0, pinata_1.pinataUpload)(image, animation, manifestBuffer, pinataJwt, pinataGateway);
                            break;
                        case storage_type_1.StorageType.Ipfs:
                            [link, imageLink, animationLink] = await (0, ipfs_1.ipfsUpload)(ipfsCredentials, image, animation, manifestBuffer);
                            break;
                        case storage_type_1.StorageType.Aws:
                            [link, imageLink, animationLink] = await (0, aws_1.awsUpload)(awsS3Bucket, image, animation, manifestBuffer);
                            break;
                        case storage_type_1.StorageType.Arweave:
                        default:
                            [link, imageLink] = await (0, arweave_1.arweaveUpload)(walletKeyPair, anchorProgram, env, image, manifestBuffer, manifest, asset.index);
                    }
                    if (animation ? link && imageLink && animationLink : link && imageLink) {
                        loglevel_1.default.debug('Updating cache for ', asset.index);
                        cacheContent.items[asset.index] = {
                            link,
                            imageLink,
                            name: manifest.name,
                            onChain: false,
                        };
                        (0, cache_1.saveCache)(cacheName, env, cacheContent);
                    }
                }
                finally {
                    progressBar.increment();
                }
            });
            progressBar.stop();
        }
        (0, cache_1.saveCache)(cacheName, env, cacheContent);
    }
    let uploadSuccessful = true;
    if (!hiddenSettings) {
        uploadSuccessful = await writeIndices({
            anchorProgram,
            cacheContent,
            cacheName,
            env,
            candyMachine,
            walletKeyPair,
            rateLimit,
        });
        const uploadedItems = Object.values(cacheContent.items).filter((f) => !!f.link).length;
        uploadSuccessful = uploadSuccessful && uploadedItems === totalNFTs;
    }
    else {
        loglevel_1.default.info('Skipping upload to chain as this is a hidden Candy Machine');
    }
    console.log(`Done. Successful = ${uploadSuccessful}.`);
    return uploadSuccessful;
}
exports.uploadV2 = uploadV2;
/**
 * From the Cache object & a list of file paths, return a list of asset keys
 * (filenames without extension nor path) that should be uploaded, sorted numerically in ascending order.
 * Assets which should be uploaded either are not present in the Cache object,
 * or do not truthy value for the `link` property.
 */
function getAssetKeysNeedingUpload(items, files) {
    const all = [
        ...new Set([
            ...Object.keys(items),
            ...files.map(filePath => path_1.default.basename(filePath)),
        ]),
    ];
    const keyMap = {};
    return all
        .filter(k => !k.includes('.json'))
        .reduce((acc, assetKey) => {
        var _a;
        const ext = path_1.default.extname(assetKey);
        const key = path_1.default.basename(assetKey, ext);
        if (!((_a = items[key]) === null || _a === void 0 ? void 0 : _a.link) && !keyMap[key]) {
            keyMap[key] = true;
            acc.push({ mediaExt: ext, index: key });
        }
        return acc;
    }, [])
        .sort((a, b) => Number.parseInt(a.index, 10) - Number.parseInt(b.index, 10));
}
/**
 * Returns a Manifest from a path and an assetKey
 * Replaces image.ext => index.ext
 * Replaces animation_url.ext => index.ext
 */
function getAssetManifest(dirname, assetKey) {
    const assetIndex = assetKey.includes('.json')
        ? assetKey.substring(0, assetKey.length - 5)
        : assetKey;
    const manifestPath = path_1.default.join(dirname, `${assetIndex}.json`);
    const manifest = JSON.parse(fs_1.default.readFileSync(manifestPath).toString());
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
async function writeIndices({ anchorProgram, cacheContent, cacheName, env, candyMachine, walletKeyPair, rateLimit, }) {
    let uploadSuccessful = true;
    const keys = Object.keys(cacheContent.items);
    const poolArray = [];
    const allIndicesInSlice = Array.from(Array(keys.length).keys());
    let offset = 0;
    while (offset < allIndicesInSlice.length) {
        let length = 0;
        let lineSize = 0;
        let configLines = allIndicesInSlice.slice(offset, offset + 16);
        while (length < 850 &&
            lineSize < 16 &&
            configLines[lineSize] !== undefined) {
            length +=
                cacheContent.items[keys[configLines[lineSize]]].link.length +
                    cacheContent.items[keys[configLines[lineSize]]].name.length;
            if (length < 850)
                lineSize++;
        }
        configLines = allIndicesInSlice.slice(offset, offset + lineSize);
        offset += lineSize;
        const onChain = configLines.filter(i => { var _a; return ((_a = cacheContent.items[keys[i]]) === null || _a === void 0 ? void 0 : _a.onChain) || false; });
        const index = keys[configLines[0]];
        if (onChain.length != configLines.length) {
            poolArray.push({ index, configLines });
        }
    }
    loglevel_1.default.info(`Writing all indices in ${poolArray.length} transactions...`);
    const progressBar = new cliProgress.SingleBar({
        format: 'Progress: [{bar}] {percentage}% | {value}/{total}',
    }, cliProgress.Presets.shades_classic);
    progressBar.start(poolArray.length, 0);
    const addConfigLines = async ({ index, configLines }) => {
        const response = await anchorProgram.rpc.addConfigLines(index, configLines.map(i => ({
            uri: cacheContent.items[keys[i]].link,
            name: cacheContent.items[keys[i]].name,
        })), {
            accounts: {
                candyMachine,
                authority: walletKeyPair.publicKey,
            },
            signers: [walletKeyPair],
        });
        loglevel_1.default.debug(response);
        configLines.forEach(i => {
            cacheContent.items[keys[i]] = {
                ...cacheContent.items[keys[i]],
                onChain: true,
                verifyRun: false,
            };
        });
        (0, cache_1.saveCache)(cacheName, env, cacheContent);
        progressBar.increment();
    };
    await promise_pool_1.PromisePool.withConcurrency(rateLimit || 5)
        .for(poolArray)
        .handleError(async (err, { index, configLines }) => {
        loglevel_1.default.error(`\nFailed writing indices ${index}-${keys[configLines[configLines.length - 1]]}: ${err.message}`);
        await (0, various_1.sleep)(5000);
        uploadSuccessful = false;
    })
        .process(async ({ index, configLines }) => {
        await addConfigLines({ index, configLines });
    });
    progressBar.stop();
    (0, cache_1.saveCache)(cacheName, env, cacheContent);
    return uploadSuccessful;
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
    cacheKeys.forEach((cacheKey, idx) => {
        cache.items[cacheKey] = {
            link: links[idx],
            name: names[idx],
            onChain: false,
        };
    });
}
async function upload({ files, cacheName, env, keypair, storage, rpcUrl, ipfsCredentials, awsS3Bucket, arweaveJwk, batchSize, }) {
    var _a;
    // Read the content of the Cache file into the Cache object, initialize it
    // otherwise.
    const cache = (0, cache_1.loadCache)(cacheName, env);
    if (cache === undefined) {
        loglevel_1.default.error('Existing cache not found. To create a new candy machine, please use candy machine v2.');
        throw new Error('Existing cache not found');
    }
    // Make sure config exists in cache
    if (!((_a = cache.program) === null || _a === void 0 ? void 0 : _a.config)) {
        loglevel_1.default.error('existing config account not found in cache. To create a new candy machine, please use candy machine v2.');
        throw new Error('config account not found in cache');
    }
    const config = new web3_js_1.PublicKey(cache.program.config);
    cache.items = cache.items || {};
    // Retrieve the directory path where the assets are located.
    const dirname = path_1.default.dirname(files[0]);
    // Compile a sorted list of assets which need to be uploaded.
    const dedupedAssetKeys = getAssetKeysNeedingUpload(cache.items, files);
    // Initialize variables that might be needed for uploded depending on storage
    // type.
    // These will be needed anyway either to initialize the
    // Candy Machine Custom Program configuration, or to write the assets
    // to the deployed configuration on chain.
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgram)(walletKeyPair, env, rpcUrl);
    // Some assets need to be uploaded.
    if (dedupedAssetKeys.length) {
        // Arweave Native storage leverages Arweave Bundles.
        // It allows to ncapsulate multiple independent data transactions
        // into a single top level transaction,
        // which pays the reward for all bundled data.
        // https://github.com/Bundlr-Network/arbundles
        // Each bundle consists of one or multiple asset filepair (PNG + JSON).
        if (storage === storage_type_1.StorageType.ArweaveBundle ||
            storage === storage_type_1.StorageType.ArweaveSol) {
            // Initialize the Arweave Bundle Upload Generator.
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
            const arweaveBundleUploadGenerator = (0, arweave_bundle_1.makeArweaveBundleUploadGenerator)(storage, dirname, dedupedAssetKeys, env, storage === storage_type_1.StorageType.ArweaveBundle
                ? JSON.parse((await (0, promises_1.readFile)(arweaveJwk)).toString())
                : undefined, storage === storage_type_1.StorageType.ArweaveSol ? walletKeyPair : undefined, batchSize);
            // Loop over every uploaded bundle of asset filepairs (PNG + JSON)
            // and save the results to the Cache object, persist it to the Cache file.
            for await (const value of arweaveBundleUploadGenerator) {
                const { cacheKeys, arweavePathManifestLinks, updatedManifests } = value;
                updateCacheAfterUpload(cache, cacheKeys, arweavePathManifestLinks, updatedManifests.map(m => m.name));
                (0, cache_1.saveCache)(cacheName, env, cache);
                loglevel_1.default.info('Saved bundle upload result to cache.');
            }
            loglevel_1.default.info('Upload done.');
        }
        else {
            // For other storage methods, we upload the files individually.
            const SIZE = dedupedAssetKeys.length;
            const tick = SIZE / 100; // print every one percent
            let lastPrinted = 0;
            await Promise.all((0, various_1.chunks)(Array.from(Array(SIZE).keys()), batchSize || 50).map(async (allIndicesInSlice) => {
                for (let i = 0; i < allIndicesInSlice.length; i++) {
                    const assetKey = dedupedAssetKeys[i];
                    const image = path_1.default.join(dirname, `${assetKey.index}${assetKey.mediaExt}`);
                    const manifest = getAssetManifest(dirname, assetKey.index);
                    let animation = undefined;
                    if ('animation_url' in manifest) {
                        animation = path_1.default.join(dirname, `${manifest.animation_url}`);
                    }
                    const manifestBuffer = Buffer.from(JSON.stringify(manifest));
                    if (i >= lastPrinted + tick || i === 0) {
                        lastPrinted = i;
                        loglevel_1.default.info(`Processing asset: ${assetKey}`);
                    }
                    let link, imageLink, animationLink;
                    try {
                        switch (storage) {
                            case storage_type_1.StorageType.Ipfs:
                                [link, imageLink, animationLink] = await (0, ipfs_1.ipfsUpload)(ipfsCredentials, image, animation, manifestBuffer);
                                break;
                            case storage_type_1.StorageType.Aws:
                                [link, imageLink, animationLink] = await (0, aws_1.awsUpload)(awsS3Bucket, image, animation, manifestBuffer);
                                break;
                            case storage_type_1.StorageType.Arweave:
                            default:
                                [link, imageLink] = await (0, arweave_1.arweaveUpload)(walletKeyPair, anchorProgram, env, image, manifestBuffer, manifest, i);
                        }
                        if (animation
                            ? link && imageLink && animationLink
                            : link && imageLink) {
                            loglevel_1.default.debug('Updating cache for ', assetKey);
                            cache.items[assetKey.index] = {
                                link,
                                imageLink,
                                name: manifest.name,
                                onChain: false,
                            };
                            (0, cache_1.saveCache)(cacheName, env, cache);
                        }
                    }
                    catch (err) {
                        loglevel_1.default.error(`Error uploading file ${assetKey}`, err);
                        throw err;
                    }
                }
            }));
        }
        setAuthority(walletKeyPair.publicKey, cache, cacheName, env);
        return writeIndices({
            anchorProgram,
            cacheContent: cache,
            cacheName,
            env,
            candyMachine: config,
            walletKeyPair,
            rateLimit: 10,
        });
    }
}
exports.upload = upload;
