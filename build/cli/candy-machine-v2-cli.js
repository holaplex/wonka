#!/usr/bin/env ts-node
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const commander_1 = require("commander");
const anchor = __importStar(require("@project-serum/anchor"));
const various_1 = require("./helpers/various");
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("./helpers/constants");
const accounts_1 = require("./helpers/accounts");
const upload_1 = require("./commands/upload");
const verifyTokenMetadata_1 = require("./commands/verifyTokenMetadata");
const cache_1 = require("./helpers/cache");
const mint_1 = require("./commands/mint");
const sign_1 = require("./commands/sign");
const signAll_1 = require("./commands/signAll");
const owners_1 = require("./commands/owners");
const loglevel_1 = __importDefault(require("loglevel"));
const withdraw_1 = require("./commands/withdraw");
const updateFromCache_1 = require("./commands/updateFromCache");
const storage_type_1 = require("./helpers/storage-type");
const mime_1 = require("mime");
const remove_collection_1 = require("./commands/remove-collection");
const set_collection_1 = require("./commands/set-collection");
const arweave_bundle_1 = require("./helpers/upload/arweave-bundle");
const bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
commander_1.program.version('0.0.2');
const supportedImageTypes = {
    'image/png': 1,
    'image/gif': 1,
    'image/jpeg': 1,
};
const supportedAnimationTypes = {
    'video/mp4': 1,
    'video/quicktime': 1,
    'audio/mpeg': 1,
    'audio/x-flac': 1,
    'audio/wav': 1,
    'model/gltf-binary': 1,
    'text/html': 1,
};
if (!fs.existsSync(constants_1.CACHE_PATH)) {
    fs.mkdirSync(constants_1.CACHE_PATH);
}
loglevel_1.default.setLevel(loglevel_1.default.levels.INFO);
// From commander examples
function myParseInt(value) {
    // parseInt takes a string and a radix
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
        throw new commander_1.InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}
programCommand('version', { requireWallet: false }).action(async () => {
    const revision = require('child_process')
        .execSync('git rev-parse HEAD')
        .toString()
        .trim();
    loglevel_1.default.info(`Candy Machine Version: ${revision}`);
});
programCommand('upload')
    .argument('<directory>', 'Directory containing images named from 0-n', val => {
    return fs.readdirSync(`${val}`).map(file => path.join(val, file));
})
    .requiredOption('-cp, --config-path <string>', 'JSON file with candy machine settings')
    .option('-r, --rpc-url <string>', 'custom rpc url since this is a heavy command')
    .option('-rl, --rate-limit <number>', 'max number of concurrent requests for the write indices command', myParseInt, 5)
    .option('-m, --collection-mint <string>', 'optional collection mint ID. Will be randomly generated if not provided')
    .option('-nc, --no-set-collection-mint', 'optional flag to prevent the candy machine from using an on chain collection')
    .action(async (files, options, cmd) => {
    const { keypair, env, cacheName, configPath, rpcUrl, rateLimit, collectionMint, setCollectionMint, } = cmd.opts();
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgramV2)(walletKeyPair, env, rpcUrl);
    const { storage, nftStorageKey, nftStorageGateway, ipfsInfuraProjectId, number, ipfsInfuraSecret, pinataJwt, pinataGateway, arweaveJwk, awsS3Bucket, retainAuthority, mutable, batchSize, price, splToken, treasuryWallet, gatekeeper, endSettings, hiddenSettings, whitelistMintSettings, goLiveDate, uuid, } = await (0, various_1.getCandyMachineV2Config)(walletKeyPair, anchorProgram, configPath);
    if (storage === storage_type_1.StorageType.ArweaveSol && env !== 'mainnet-beta') {
        loglevel_1.default.info('\x1b[31m%s\x1b[0m', 'WARNING: On Devnet, the arweave-sol storage option only stores your files for 1 week. Please upload via Mainnet Beta for your final collection.\n');
    }
    if (storage === storage_type_1.StorageType.ArweaveBundle && env !== 'mainnet-beta') {
        throw new Error('The arweave-bundle storage option only works on mainnet because it requires spending real AR tokens. For devnet, please set the --storage option to "aws" or "ipfs"\n');
    }
    if (storage === storage_type_1.StorageType.Arweave) {
        loglevel_1.default.warn('WARNING: The "arweave" storage option will be going away soon. Please migrate to arweave-bundle or arweave-sol for mainnet.\n');
    }
    if (storage === storage_type_1.StorageType.ArweaveBundle && !arweaveJwk) {
        throw new Error('Path to Arweave JWK wallet file (--arweave-jwk) must be provided when using arweave-bundle');
    }
    if (storage === storage_type_1.StorageType.Ipfs &&
        (!ipfsInfuraProjectId || !ipfsInfuraSecret)) {
        throw new Error('IPFS selected as storage option but Infura project id or secret key were not provided.');
    }
    if (storage === storage_type_1.StorageType.Aws && !awsS3Bucket) {
        throw new Error('aws selected as storage option but existing bucket name (--aws-s3-bucket) not provided.');
    }
    if (!Object.values(storage_type_1.StorageType).includes(storage)) {
        throw new Error(`Storage option must either be ${Object.values(storage_type_1.StorageType).join(', ')}. Got: ${storage}`);
    }
    const ipfsCredentials = {
        projectId: ipfsInfuraProjectId,
        secretKey: ipfsInfuraSecret,
    };
    let imageFileCount = 0;
    let animationFileCount = 0;
    let jsonFileCount = 0;
    // Filter out any non-supported file types and find the JSON vs Image file count
    const supportedFiles = files.filter(it => {
        if (supportedImageTypes[(0, mime_1.getType)(it)]) {
            imageFileCount++;
        }
        else if (supportedAnimationTypes[(0, mime_1.getType)(it)]) {
            animationFileCount++;
        }
        else if (it.endsWith(constants_1.EXTENSION_JSON)) {
            jsonFileCount++;
        }
        else {
            loglevel_1.default.warn(`WARNING: Skipping unsupported file type ${it}`);
            return false;
        }
        return true;
    });
    if (animationFileCount !== 0 && storage === storage_type_1.StorageType.Arweave) {
        throw new Error('The "arweave" storage option is incompatible with animation files. Please try again with another storage option using `--storage <option>`.');
    }
    if (animationFileCount !== 0 && animationFileCount !== jsonFileCount) {
        throw new Error(`number of animation files (${animationFileCount}) is different than the number of json files (${jsonFileCount})`);
    }
    else if (imageFileCount !== jsonFileCount) {
        throw new Error(`number of img files (${imageFileCount}) is different than the number of json files (${jsonFileCount})`);
    }
    const elemCount = number ? number : imageFileCount;
    if (elemCount < imageFileCount) {
        throw new Error(`max number (${elemCount}) cannot be smaller than the number of images in the source folder (${imageFileCount})`);
    }
    if (animationFileCount === 0) {
        loglevel_1.default.info(`Beginning the upload for ${elemCount} (img+json) pairs`);
    }
    else {
        loglevel_1.default.info(`Beginning the upload for ${elemCount} (img+animation+json) sets`);
    }
    const collectionMintPubkey = await (0, various_1.parseCollectionMintPubkey)(collectionMint, anchorProgram.provider.connection, walletKeyPair);
    const startMs = Date.now();
    loglevel_1.default.info('started at: ' + startMs.toString());
    try {
        await (0, upload_1.uploadV2)({
            files: supportedFiles,
            cacheName,
            env,
            totalNFTs: elemCount,
            gatekeeper,
            storage,
            retainAuthority,
            mutable,
            nftStorageKey,
            nftStorageGateway,
            ipfsCredentials,
            pinataJwt,
            pinataGateway,
            awsS3Bucket,
            batchSize,
            price,
            treasuryWallet,
            anchorProgram,
            walletKeyPair,
            splToken,
            endSettings,
            hiddenSettings,
            whitelistMintSettings,
            goLiveDate,
            uuid,
            arweaveJwk,
            rateLimit,
            collectionMintPubkey,
            setCollectionMint,
            rpcUrl,
        });
    }
    catch (err) {
        loglevel_1.default.warn('upload was not successful, please re-run.', err);
        process.exit(1);
    }
    const endMs = Date.now();
    const timeTaken = new Date(endMs - startMs).toISOString().substr(11, 8);
    loglevel_1.default.info(`ended at: ${new Date(endMs).toISOString()}. time taken: ${timeTaken}`);
    process.exit(0);
});
programCommand('withdraw')
    .argument('<candy_machine_id>', 'Candy machine id')
    .option('-d, --dry', 'Show Candy Machine withdraw amount without withdrawing')
    .option('-ch, --charity <string>', 'Which charity?', '')
    .option('-cp, --charityPercent <string>', 'Which percent to charity?', '0')
    .option('-r, --rpc-url <string>', 'custom rpc url since this is a heavy command')
    .action(async (candyMachineId, _, cmd) => {
    const { keypair, env, dry, charity, charityPercent, rpcUrl } = cmd.opts();
    if (charityPercent < 0 || charityPercent > 100) {
        loglevel_1.default.error('Charity percentage needs to be between 0 and 100');
        return;
    }
    const walletKeypair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgramV2)(walletKeypair, env, rpcUrl);
    const configOrCommitment = {
        commitment: 'confirmed',
        filters: [
            {
                memcmp: {
                    offset: 8,
                    bytes: walletKeypair.publicKey.toBase58(),
                },
            },
        ],
    };
    const machines = await (0, accounts_1.getProgramAccounts)(anchorProgram.provider.connection, constants_1.CANDY_MACHINE_PROGRAM_V2_ID.toBase58(), configOrCommitment);
    const currentMachine = machines === null || machines === void 0 ? void 0 : machines.find(machine => {
        return machine.pubkey === candyMachineId;
    });
    if (!currentMachine) {
        loglevel_1.default.error(`Candy Machine ${candyMachineId} not found`);
        return;
    }
    const refundAmount = currentMachine.account.lamports / web3_js_1.LAMPORTS_PER_SOL;
    const cpf = parseFloat(charityPercent);
    let charityPub;
    loglevel_1.default.info(`Amount to be drained from ${candyMachineId}: ${refundAmount}`);
    if (!!charity && charityPercent > 0) {
        const donation = refundAmount * (100 / charityPercent);
        charityPub = new web3_js_1.PublicKey(charity);
        loglevel_1.default.info(`Of that ${refundAmount}, ${donation} will be donated to ${charity}. Thank you!`);
    }
    if (!dry) {
        const errors = [];
        loglevel_1.default.info(`WARNING: This command will drain the SOL from Candy Machine ${candyMachineId}. This will break your Candy Machine if its still in use`);
        try {
            if (currentMachine.account.lamports > 0) {
                const tx = await (0, withdraw_1.withdrawV2)(anchorProgram, walletKeypair, env, new web3_js_1.PublicKey(candyMachineId), currentMachine.account.lamports, charityPub, cpf);
                loglevel_1.default.info(`${candyMachineId} has been withdrawn. \nTransaction Signature: ${tx}`);
            }
        }
        catch (e) {
            loglevel_1.default.error(`Withdraw has failed for ${candyMachineId}`, e.message);
            errors.push(e);
            return;
        }
        loglevel_1.default.info(`Congratulations, ${candyMachineId} has been successfuly drained! Please consider support Open Source developers`);
    }
});
programCommand('withdraw_all')
    .option('-d ,--dry', 'Show Candy Machine withdraw amount without withdrawing.')
    .option('-ch, --charity <string>', 'Which charity?', '')
    .option('-cp, --charityPercent <string>', 'Which percent to charity?', '0')
    .option('-r, --rpc-url <string>', 'custom rpc url since this is a heavy command')
    .action(async (directory, cmd) => {
    const { keypair, env, dry, charity, charityPercent, rpcUrl } = cmd.opts();
    if (charityPercent < 0 || charityPercent > 100) {
        loglevel_1.default.error('Charity percentage needs to be between 0 and 100');
        return;
    }
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgramV2)(walletKeyPair, env, rpcUrl);
    const configOrCommitment = {
        commitment: 'confirmed',
        filters: [
            {
                memcmp: {
                    offset: 8,
                    bytes: walletKeyPair.publicKey.toBase58(),
                },
            },
        ],
    };
    const machines = await (0, accounts_1.getProgramAccounts)(anchorProgram.provider.connection, constants_1.CANDY_MACHINE_PROGRAM_V2_ID.toBase58(), configOrCommitment);
    let t = 0;
    for (const cg in machines) {
        t += machines[cg].account.lamports;
    }
    const totalValue = t / web3_js_1.LAMPORTS_PER_SOL;
    const cpf = parseFloat(charityPercent);
    let charityPub;
    loglevel_1.default.info(`Total Number of Candy Machine Config Accounts to drain ${machines.length}`);
    loglevel_1.default.info(`${totalValue} SOL locked up in configs`);
    if (!!charity && charityPercent > 0) {
        const donation = totalValue * (100 / charityPercent);
        charityPub = new web3_js_1.PublicKey(charity);
        loglevel_1.default.info(`Of that ${totalValue} SOL, ${donation} will be donated to ${charity}. Thank you!`);
    }
    if (!dry) {
        const errors = [];
        loglevel_1.default.info('WARNING: This command will drain ALL of the Candy Machine config accounts that are owned by your current KeyPair, this will break your Candy Machine if its still in use');
        for (const cg of machines) {
            try {
                if (cg.account.lamports > 0) {
                    const tx = await (0, withdraw_1.withdrawV2)(anchorProgram, walletKeyPair, env, new web3_js_1.PublicKey(cg.pubkey), cg.account.lamports, charityPub, cpf);
                    loglevel_1.default.info(`${cg.pubkey} has been withdrawn. \nTransaction Signature: ${tx}`);
                }
            }
            catch (e) {
                loglevel_1.default.error(`Withdraw has failed for config account ${cg.pubkey} Error: ${e.message}`);
                errors.push(e);
            }
        }
        const successCount = machines.length - errors.length;
        const richness = successCount === machines.length ? 'rich again' : 'kinda rich';
        loglevel_1.default.info(`Congratulations, ${successCount} config accounts have been successfully drained.`);
        loglevel_1.default.info(`Now you ${richness}, please consider supporting Open Source developers.`);
    }
});
programCommand('withdraw_bundlr').action(async (_, cmd) => {
    const { keypair } = cmd.opts();
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    await (0, arweave_bundle_1.withdrawBundlr)(walletKeyPair);
});
commander_1.program
    .command('verify_assets')
    .argument('<directory>', 'Directory containing images and metadata files named from 0-n', val => {
    return fs
        .readdirSync(`${val}`)
        .map(file => path.join(process.cwd(), val, file));
})
    .option('-n, --number <number>', 'Number of images to upload')
    .action((files, options, cmd) => {
    const { number } = cmd.opts();
    const startMs = Date.now();
    loglevel_1.default.info('started at: ' + startMs.toString());
    (0, verifyTokenMetadata_1.verifyTokenMetadata)({ files, uploadElementsCount: number });
    const endMs = Date.now();
    const timeTaken = new Date(endMs - startMs).toISOString().substr(11, 8);
    loglevel_1.default.info(`ended at: ${new Date(endMs).toString()}. time taken: ${timeTaken}`);
});
programCommand('verify_upload')
    .option('-r, --rpc-url <string>', 'custom rpc url since this is a heavy command')
    .action(async (directory, cmd) => {
    const { env, keypair, rpcUrl, cacheName } = cmd.opts();
    const cacheContent = (0, cache_1.loadCache)(cacheName, env);
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgramV2)(walletKeyPair, env, rpcUrl);
    const candyMachine = await anchorProgram.provider.connection.getAccountInfo(new web3_js_1.PublicKey(cacheContent.program.candyMachine));
    const candyMachineObj = await anchorProgram.account.candyMachine.fetch(new web3_js_1.PublicKey(cacheContent.program.candyMachine));
    let allGood = true;
    const keys = Object.keys(cacheContent.items)
        .filter(k => !cacheContent.items[k].verifyRun)
        .sort((a, b) => Number(a) - Number(b));
    if (keys.length > 0) {
        loglevel_1.default.info(`Checking ${keys.length} items that have yet to be checked...`);
    }
    await Promise.all((0, various_1.chunks)(keys, 500).map(async (allIndexesInSlice) => {
        for (let i = 0; i < allIndexesInSlice.length; i++) {
            // Save frequently.
            if (i % 100 == 0)
                (0, cache_1.saveCache)(cacheName, env, cacheContent);
            const key = allIndexesInSlice[i];
            loglevel_1.default.info('Looking at key ', key);
            const thisSlice = candyMachine.data.slice(constants_1.CONFIG_ARRAY_START_V2 + 4 + constants_1.CONFIG_LINE_SIZE_V2 * key, constants_1.CONFIG_ARRAY_START_V2 + 4 + constants_1.CONFIG_LINE_SIZE_V2 * (key + 1));
            const name = (0, various_1.fromUTF8Array)([
                ...thisSlice.slice(4, 36).filter(n => n !== 0),
            ]);
            const uri = (0, various_1.fromUTF8Array)([
                ...thisSlice.slice(40, 240).filter(n => n !== 0),
            ]);
            const cacheItem = cacheContent.items[key];
            if (name != cacheItem.name || uri != cacheItem.link) {
                loglevel_1.default.debug(`Name (${name}) or uri (${uri}) didnt match cache values of (${cacheItem.name})` +
                    `and (${cacheItem.link}). marking to rerun for image`, key);
                cacheItem.onChain = false;
                allGood = false;
            }
            else {
                cacheItem.verifyRun = true;
            }
        }
    }));
    if (!allGood) {
        (0, cache_1.saveCache)(cacheName, env, cacheContent);
        throw new Error(`not all NFTs checked out. check out logs above for details`);
    }
    const lineCount = new anchor.BN(candyMachine.data.slice(constants_1.CONFIG_ARRAY_START_V2, constants_1.CONFIG_ARRAY_START_V2 + 4), undefined, 'le');
    loglevel_1.default.info(`uploaded (${lineCount.toNumber()}) out of (${candyMachineObj.data.itemsAvailable})`);
    if (candyMachineObj.data.itemsAvailable > lineCount.toNumber()) {
        throw new Error(`predefined number of NFTs (${candyMachineObj.data.itemsAvailable}) is smaller than the uploaded one (${lineCount.toNumber()})`);
    }
    else {
        loglevel_1.default.info('ready to deploy!');
    }
    (0, cache_1.saveCache)(cacheName, env, cacheContent);
});
programCommand('verify_price')
    .requiredOption('-p, --price <string>')
    .option('--cache-path <string>')
    .option('-r, --rpc-url <string>', 'custom rpc url since this is a heavy command')
    .action(async (directory, cmd) => {
    const { keypair, env, price, cacheName, rpcUrl, cachePath } = cmd.opts();
    const lamports = (0, various_1.parsePrice)(price);
    if (isNaN(lamports)) {
        return loglevel_1.default.error(`verify_price requires a valid --price to be set`);
    }
    loglevel_1.default.info(`Expected price is: ${lamports}`);
    const cacheContent = (0, cache_1.loadCache)(cacheName, env, cachePath);
    if (!cacheContent) {
        return loglevel_1.default.error(`No cache found, can't continue. Make sure you are in the correct directory where the assets are located or use the --cache-path option.`);
    }
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgramV2)(walletKeyPair, env, rpcUrl);
    const candyAddress = new web3_js_1.PublicKey(cacheContent.program.candyMachine);
    const machine = await anchorProgram.account.candyMachine.fetch(candyAddress);
    //@ts-ignore
    const candyMachineLamports = machine.data.price.toNumber();
    loglevel_1.default.info(`Candymachine price is: ${candyMachineLamports}`);
    if (lamports != candyMachineLamports) {
        throw new Error(`Expected price and CandyMachine's price do not match!`);
    }
    loglevel_1.default.info(`Good to go!`);
});
programCommand('show')
    .option('--cache-path <string>')
    .option('-r, --rpc-url <string>', 'custom rpc url since this is a heavy command')
    .option('-cm, --candy-machine-address <string>', 'Optional candy machine address to replace the cache path')
    .action(async (directory, cmd) => {
    var _a;
    const { keypair, env, cacheName, rpcUrl, cachePath, candyMachineAddress } = cmd.opts();
    const cacheContent = candyMachineAddress
        ? { program: { candyMachine: candyMachineAddress } }
        : (0, cache_1.loadCache)(cacheName, env, cachePath);
    if (!cacheContent) {
        return loglevel_1.default.error(`No cache found, can't continue. Make sure you are in the correct directory where the assets are located or use the --cache-path option.`);
    }
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgramV2)(walletKeyPair, env, rpcUrl);
    try {
        const machine = await anchorProgram.account.candyMachine.fetch(cacheContent.program.candyMachine);
        const [candyMachineAddr] = await (0, accounts_1.deriveCandyMachineV2ProgramAddress)(new web3_js_1.PublicKey(cacheContent.program.candyMachine));
        const [collectionPDAPubkey] = await (0, accounts_1.getCollectionPDA)(new web3_js_1.PublicKey(cacheContent.program.candyMachine));
        let collectionData = null;
        const collectionPDAAccount = await anchorProgram.provider.connection.getAccountInfo(collectionPDAPubkey);
        if (collectionPDAAccount) {
            collectionData = (await anchorProgram.account.collectionPda.fetch(collectionPDAPubkey));
        }
        loglevel_1.default.info('...Candy Machine...');
        loglevel_1.default.info('Key:', cacheContent.program.candyMachine);
        loglevel_1.default.info('1st creator :', candyMachineAddr.toBase58());
        //@ts-ignore
        loglevel_1.default.info('authority: ', machine.authority.toBase58());
        //@ts-ignore
        loglevel_1.default.info('wallet: ', machine.wallet.toBase58());
        if (collectionPDAAccount) {
            loglevel_1.default.info('Collection mint: ', collectionData === null || collectionData === void 0 ? void 0 : collectionData.mint.toBase58());
            loglevel_1.default.info('Collection PDA: ', collectionPDAPubkey.toBase58());
        }
        //@ts-ignore
        loglevel_1.default.info('tokenMint: ', 
        //@ts-ignore
        machine.tokenMint ? machine.tokenMint.toBase58() : null);
        //@ts-ignore
        loglevel_1.default.info('uuid: ', machine.data.uuid);
        //@ts-ignore
        loglevel_1.default.info('price: ', machine.data.price.toNumber());
        //@ts-ignore
        loglevel_1.default.info('itemsAvailable: ', machine.data.itemsAvailable.toNumber());
        //@ts-ignore
        loglevel_1.default.info('itemsRedeemed: ', machine.itemsRedeemed.toNumber());
        loglevel_1.default.info('goLiveDate: ', 
        //@ts-ignore
        machine.data.goLiveDate
            ? //@ts-ignore
                new Date(machine.data.goLiveDate * 1000)
            : 'N/A');
        //@ts-ignore
        loglevel_1.default.info('symbol: ', machine.data.symbol);
        //@ts-ignore
        loglevel_1.default.info('sellerFeeBasisPoints: ', machine.data.sellerFeeBasisPoints);
        //@ts-ignore
        loglevel_1.default.info('creators: ');
        //@ts-ignore
        machine.data.creators.map(c => loglevel_1.default.info(c.address.toBase58(), 'at', c.share, '%')),
            //@ts-ignore
            loglevel_1.default.info('maxSupply: ', machine.data.maxSupply.toNumber());
        //@ts-ignore
        loglevel_1.default.info('retainAuthority: ', machine.data.retainAuthority);
        //@ts-ignore
        loglevel_1.default.info('isMutable: ', machine.data.isMutable);
        //@ts-ignore
        loglevel_1.default.info('hidden settings: ', machine.data.hiddenSettings);
        if (machine.data.endSettings) {
            loglevel_1.default.info('End settings: ');
            if (machine.data.endSettings.endSettingType.date) {
                //@ts-ignore
                loglevel_1.default.info('End on', new Date(machine.data.endSettings.number * 1000));
            }
            else {
                loglevel_1.default.info('End when', machine.data.endSettings.number.toNumber(), 'sold');
            }
        }
        else {
            loglevel_1.default.info('No end settings detected');
        }
        if (machine.data.gatekeeper) {
            loglevel_1.default.info('Captcha settings:');
            loglevel_1.default.info('Gatekeeper:', machine.data.gatekeeper.gatekeeperNetwork.toBase58());
            loglevel_1.default.info('Expires on use:', machine.data.gatekeeper.expireOnUse);
        }
        else {
            loglevel_1.default.info('No captcha for this candy machine');
        }
        if (machine.data.whitelistMintSettings) {
            //@ts-ignore
            loglevel_1.default.info('whitelist settings: ');
            //@ts-ignore
            loglevel_1.default.info('Mint: ', machine.data.whitelistMintSettings.mint.toBase58());
            //@ts-ignore
            loglevel_1.default.info('Mode: ', machine.data.whitelistMintSettings.mode);
            //@ts-ignore
            loglevel_1.default.info('Presale: ', machine.data.whitelistMintSettings.presale);
            //@ts-ignore
            loglevel_1.default.info('Discounted Price: ', ((_a = machine.data.whitelistMintSettings.discountPrice) === null || _a === void 0 ? void 0 : _a.toNumber()) || 'N/A');
        }
        else {
            loglevel_1.default.info('no whitelist settings');
        }
    }
    catch (e) {
        loglevel_1.default.error(e);
        loglevel_1.default.error('No machine found');
    }
});
programCommand('update_candy_machine')
    .requiredOption('-cp, --config-path <string>', 'JSON file with candy machine settings')
    .option('-r, --rpc-url <string>', 'custom rpc url since this is a heavy command')
    .option('--new-authority <Pubkey>', 'New Authority. Base58-encoded')
    .action(async (directory, cmd) => {
    const { keypair, env, rpcUrl, configPath, newAuthority, cacheName } = cmd.opts();
    const cacheContent = (0, cache_1.loadCache)(cacheName, env);
    const newAuthorityKey = newAuthority ? new web3_js_1.PublicKey(newAuthority) : null;
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgramV2)(walletKeyPair, env, rpcUrl);
    const candyMachine = new web3_js_1.PublicKey(cacheContent.program.candyMachine);
    const candyMachineObj = await anchorProgram.account.candyMachine.fetch(candyMachine);
    const { number, retainAuthority, mutable, price, splToken, treasuryWallet, gatekeeper, endSettings, hiddenSettings, whitelistMintSettings, goLiveDate, uuid, } = await (0, various_1.getCandyMachineV2Config)(walletKeyPair, anchorProgram, configPath);
    const newSettings = {
        itemsAvailable: number
            ? new anchor.BN(number)
            : candyMachineObj.data.itemsAvailable,
        uuid: uuid || candyMachineObj.data.uuid,
        symbol: candyMachineObj.data.symbol,
        sellerFeeBasisPoints: candyMachineObj.data.sellerFeeBasisPoints,
        isMutable: mutable,
        maxSupply: new anchor.BN(0),
        retainAuthority: retainAuthority,
        gatekeeper,
        goLiveDate,
        endSettings,
        price,
        whitelistMintSettings,
        hiddenSettings,
        creators: candyMachineObj.data.creators.map(creator => {
            return {
                address: new web3_js_1.PublicKey(creator.address),
                verified: true,
                share: creator.share,
            };
        }),
    };
    const remainingAccounts = [];
    if (splToken) {
        remainingAccounts.push({
            pubkey: splToken,
            isSigner: false,
            isWritable: false,
        });
    }
    const tx = await anchorProgram.rpc.updateCandyMachine(newSettings, {
        accounts: {
            candyMachine,
            authority: walletKeyPair.publicKey,
            wallet: treasuryWallet,
        },
        remainingAccounts: remainingAccounts.length > 0 ? remainingAccounts : undefined,
    });
    cacheContent.startDate = goLiveDate;
    loglevel_1.default.info('update_candy_machine finished', tx);
    if (newAuthorityKey) {
        const tx = await anchorProgram.rpc.updateAuthority(newAuthorityKey, {
            accounts: {
                candyMachine,
                authority: walletKeyPair.publicKey,
                wallet: treasuryWallet,
            },
        });
        cacheContent.authority = newAuthorityKey.toBase58();
        loglevel_1.default.info(` - updated authority: ${newAuthorityKey.toBase58()}`);
        loglevel_1.default.info('update_authority finished', tx);
    }
    (0, cache_1.saveCache)(cacheName, env, cacheContent);
});
programCommand('set_collection')
    .option('-m, --collection-mint <string>', 'optional collection mint ID. Will be randomly generated if not provided')
    .option('-r, --rpc-url <string>', 'custom rpc url since this is a heavy command')
    .action(async (directory, cmd) => {
    const { keypair, env, cacheName, rpcUrl, collectionMint } = cmd.opts();
    const cacheContent = (0, cache_1.loadCache)(cacheName, env);
    const candyMachine = new web3_js_1.PublicKey(cacheContent.program.candyMachine);
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgramV2)(walletKeyPair, env, rpcUrl);
    const collectionMintPubkey = await (0, various_1.parseCollectionMintPubkey)(collectionMint, anchorProgram.provider.connection, walletKeyPair);
    const tx = await (0, set_collection_1.setCollection)(walletKeyPair, anchorProgram, candyMachine, collectionMintPubkey);
    loglevel_1.default.info('set collection finished', tx);
});
programCommand('remove_collection')
    .option('-r, --rpc-url <string>', 'custom rpc url since this is a heavy command')
    .action(async (directory, cmd) => {
    const { keypair, env, cacheName, rpcUrl } = cmd.opts();
    const cacheContent = (0, cache_1.loadCache)(cacheName, env);
    const candyMachine = new web3_js_1.PublicKey(cacheContent.program.candyMachine);
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgramV2)(walletKeyPair, env, rpcUrl);
    const tx = await (0, remove_collection_1.removeCollection)(walletKeyPair, anchorProgram, candyMachine);
    loglevel_1.default.info('remove collection finished', tx);
});
programCommand('mint_one_token')
    .option('-r, --rpc-url <string>', 'custom rpc url since this is a heavy command')
    .action(async (directory, cmd) => {
    const { keypair, env, cacheName, rpcUrl } = cmd.opts();
    const cacheContent = (0, cache_1.loadCache)(cacheName, env);
    const candyMachine = new web3_js_1.PublicKey(cacheContent.program.candyMachine);
    const tx = await (0, mint_1.mintV2)(keypair, env, candyMachine, rpcUrl);
    loglevel_1.default.info('mint_one_token finished', tx);
});
programCommand('mint_multiple_tokens')
    .requiredOption('-n, --number <string>', 'Number of tokens')
    .option('-r, --rpc-url <string>', 'custom rpc url since this is a heavy command')
    .action(async (_, cmd) => {
    const { keypair, env, cacheName, number, rpcUrl } = cmd.opts();
    const NUMBER_OF_NFTS_TO_MINT = parseInt(number, 10);
    const cacheContent = (0, cache_1.loadCache)(cacheName, env);
    const candyMachine = new web3_js_1.PublicKey(cacheContent.program.candyMachine);
    loglevel_1.default.info(`Minting ${NUMBER_OF_NFTS_TO_MINT} tokens...`);
    const mintToken = async (index) => {
        const tx = await (0, mint_1.mintV2)(keypair, env, candyMachine, rpcUrl);
        loglevel_1.default.info(`transaction ${index + 1} complete`, tx);
        if (index < NUMBER_OF_NFTS_TO_MINT - 1) {
            loglevel_1.default.info('minting another token...');
            await mintToken(index + 1);
        }
    };
    await mintToken(0);
    loglevel_1.default.info(`minted ${NUMBER_OF_NFTS_TO_MINT} tokens`);
    loglevel_1.default.info('mint_multiple_tokens finished');
});
programCommand('sign')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .requiredOption('-m, --metadata <string>', 'base58 metadata account id')
    .option('-r, --rpc-url <string>', 'custom rpc url since this is a heavy command')
    .action(async (directory, cmd) => {
    const { keypair, env, rpcUrl, metadata } = cmd.opts();
    await (0, sign_1.signMetadata)(metadata, keypair, env, rpcUrl);
});
programCommand('sign_all')
    .option('-b, --batch-size <string>', 'Batch size', '10')
    .option('-d, --daemon', 'Run signing continuously', false)
    .option('-r, --rpc-url <string>', 'custom rpc url since this is a heavy command')
    .action(async (directory, cmd) => {
    const { keypair, env, cacheName, rpcUrl, batchSize, daemon } = cmd.opts();
    const cacheContent = (0, cache_1.loadCache)(cacheName, env);
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgramV2)(walletKeyPair, env, rpcUrl);
    const batchSizeParsed = parseInt(batchSize);
    if (!parseInt(batchSize)) {
        throw new Error('Batch size needs to be an integer!');
    }
    const candyMachineId = new web3_js_1.PublicKey(cacheContent.program.candyMachine);
    const [candyMachineAddr] = await (0, accounts_1.deriveCandyMachineV2ProgramAddress)(candyMachineId);
    loglevel_1.default.debug('Creator pubkey: ', walletKeyPair.publicKey.toBase58());
    loglevel_1.default.debug('Environment: ', env);
    loglevel_1.default.debug('Candy machine address: ', cacheContent.program.candyMachine);
    loglevel_1.default.debug('Batch Size: ', batchSizeParsed);
    await (0, signAll_1.signAllMetadataFromCandyMachine)(anchorProgram.provider.connection, walletKeyPair, candyMachineAddr.toBase58(), batchSizeParsed, daemon);
});
programCommand('update_existing_nfts_from_latest_cache_file')
    .option('-b, --batch-size <string>', 'Batch size', '2')
    .option('-nc, --new-cache <string>', 'New cache file name')
    .option('-d, --daemon', 'Run updating continuously', false)
    .option('-r, --rpc-url <string>', 'custom rpc url since this is a heavy command')
    .action(async (directory, cmd) => {
    const { keypair, env, cacheName, rpcUrl, batchSize, daemon, newCache } = cmd.opts();
    const cacheContent = (0, cache_1.loadCache)(cacheName, env);
    const newCacheContent = (0, cache_1.loadCache)(newCache, env);
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgramV2)(walletKeyPair, env, rpcUrl);
    const candyAddress = cacheContent.program.candyMachine;
    const batchSizeParsed = parseInt(batchSize);
    if (!parseInt(batchSize)) {
        throw new Error('Batch size needs to be an integer!');
    }
    loglevel_1.default.debug('Creator pubkey: ', walletKeyPair.publicKey.toBase58());
    loglevel_1.default.debug('Environment: ', env);
    loglevel_1.default.debug('Candy machine address: ', candyAddress);
    loglevel_1.default.debug('Batch Size: ', batchSizeParsed);
    await (0, updateFromCache_1.updateFromCache)(anchorProgram.provider.connection, walletKeyPair, candyAddress, batchSizeParsed, daemon, cacheContent, newCacheContent);
});
programCommand('get_all_mint_addresses').action(async (directory, cmd) => {
    const { env, cacheName, keypair } = cmd.opts();
    const cacheContent = (0, cache_1.loadCache)(cacheName, env);
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgramV2)(walletKeyPair, env);
    const candyMachineId = new web3_js_1.PublicKey(cacheContent.program.candyMachine);
    const [candyMachineAddr] = await (0, accounts_1.deriveCandyMachineV2ProgramAddress)(candyMachineId);
    loglevel_1.default.info('Getting mint addresses...');
    const addresses = await (0, signAll_1.getAddressesByCreatorAddress)(candyMachineAddr.toBase58(), anchorProgram.provider.connection);
    fs.writeFileSync('./mint-addresses.json', JSON.stringify(addresses, null, 2));
    loglevel_1.default.info('Successfully saved mint addresses to mint-addresses.json');
});
programCommand('get_all_owners_addresses').action(async (directory, cmd) => {
    const { env, cacheName, keypair } = cmd.opts();
    const cacheContent = (0, cache_1.loadCache)(cacheName, env);
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgramV2)(walletKeyPair, env);
    const candyMachineId = new web3_js_1.PublicKey(cacheContent.program.candyMachine);
    const [candyMachineAddr] = await (0, accounts_1.deriveCandyMachineV2ProgramAddress)(candyMachineId);
    loglevel_1.default.info('Getting mint addresses...');
    const addresses = await (0, signAll_1.getAddressesByCreatorAddress)(candyMachineAddr.toBase58(), anchorProgram.provider.connection);
    loglevel_1.default.info('Getting owner addresses...');
    const owners = await (0, owners_1.getOwnersByMintAddresses)(addresses, anchorProgram.provider.connection);
    fs.writeFileSync('./owner-addresses.json', JSON.stringify(owners, null, 2));
    loglevel_1.default.info('Successfully saved owner addresses to owner-addresses.json');
});
programCommand('get_unminted_tokens').action(async (directory, cmd) => {
    const { keypair, env, cacheName } = cmd.opts();
    const cacheContent = (0, cache_1.loadCache)(cacheName, env);
    const walletKeyPair = (0, accounts_1.loadWalletKey)(keypair);
    const anchorProgram = await (0, accounts_1.loadCandyProgramV2)(walletKeyPair, env);
    const candyAddress = cacheContent.program.candyMachine;
    loglevel_1.default.debug('Creator pubkey: ', walletKeyPair.publicKey.toBase58());
    loglevel_1.default.debug('Environment: ', env);
    loglevel_1.default.debug('Candy machine address: ', candyAddress);
    const itemsAvailable = Object.keys(cacheContent.items).length;
    const candyMachine = await anchorProgram.provider.connection.getAccountInfo(new anchor.web3.PublicKey(candyAddress));
    const thisSlice = candyMachine.data.slice(constants_1.CONFIG_ARRAY_START_V2 +
        4 +
        constants_1.CONFIG_LINE_SIZE_V2 * itemsAvailable +
        4 +
        Math.floor(itemsAvailable / 8) +
        4, candyMachine.data.length);
    let index = 0;
    const unminted = {};
    for (let i = 0; i < thisSlice.length; i++) {
        const start = 1 << 7;
        for (let j = 0; j < 8 && index < itemsAvailable; j++) {
            if (!(thisSlice[i] & (start >> j))) {
                unminted[index.toString()] = cacheContent.items[index.toString()];
                loglevel_1.default.debug('Unminted token index', index);
            }
            index++;
        }
    }
    const found = Object.keys(unminted).length;
    if (found > 0) {
        fs.writeFileSync('./unminted-tokens.json', JSON.stringify(unminted, null, 2));
        loglevel_1.default.info(`Done - successfully saved ${found} unminted token(s) information to 'unminted-tokens.json' file`);
    }
    else {
        loglevel_1.default.info('Nothing to do - all tokens have been minted');
    }
});
function programCommand(name, options = { requireWallet: true }) {
    let cmProgram = commander_1.program
        .command(name)
        .option('-e, --env <string>', 'Solana cluster env name', 'devnet')
        .option('-l, --log-level <string>', 'log level', setLogLevel)
        .option('-c, --cache-name <string>', 'Cache file name', 'temp');
    if (options.requireWallet) {
        cmProgram = cmProgram.requiredOption('-k, --keypair <path>', `Solana wallet location`);
    }
    return cmProgram;
}
programCommand('decode_private_key', { requireWallet: false })
    .argument('<private key>', 'Base58 encoded private key')
    .action(async (privKey) => {
    const decodedPrivKey = Uint8Array.from(bytes_1.bs58.decode(privKey));
    console.log(decodedPrivKey);
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setLogLevel(value, prev) {
    if (value === undefined || value === null) {
        return;
    }
    loglevel_1.default.info('setting the log value to: ' + value);
    loglevel_1.default.setLevel(value);
}
commander_1.program.parse(process.argv);
