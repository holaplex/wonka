"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipfsUpload = void 0;
const loglevel_1 = __importDefault(require("loglevel"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const ipfs_http_client_1 = require("ipfs-http-client");
const path_1 = __importDefault(require("path"));
const file_uri_1 = require("./file-uri");
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function ipfsUpload(ipfsCredentials, image, animation, manifestBuffer) {
    const tokenIfps = `${ipfsCredentials.projectId}:${ipfsCredentials.secretKey}`;
    // @ts-ignore
    const ipfs = (0, ipfs_http_client_1.create)('https://ipfs.infura.io:5001');
    const authIFPS = Buffer.from(tokenIfps).toString('base64');
    const uploadToIpfs = async (source) => {
        const { cid } = await ipfs.add(source).catch();
        return cid;
    };
    async function uploadMedia(media) {
        const mediaHash = await uploadToIpfs((0, ipfs_http_client_1.globSource)(media, { recursive: true }));
        loglevel_1.default.debug('mediaHash:', mediaHash);
        const mediaUrl = `https://ipfs.io/ipfs/${mediaHash}`;
        loglevel_1.default.info('mediaUrl:', mediaUrl);
        await (0, node_fetch_1.default)(`https://ipfs.infura.io:5001/api/v0/pin/add?arg=${mediaHash}`, {
            headers: {
                Authorization: `Basic ${authIFPS}`,
            },
            method: 'POST',
        });
        loglevel_1.default.info('uploaded media for file:', media);
        return mediaUrl;
    }
    const imageUrl = `${await uploadMedia(image)}?ext=${path_1.default
        .extname(image)
        .replace('.', '')}`;
    const animationUrl = animation
        ? `${await uploadMedia(animation)}?ext=${path_1.default
            .extname(animation)
            .replace('.', '')}`
        : undefined;
    const manifestJson = await (0, file_uri_1.setImageUrlManifest)(manifestBuffer.toString('utf8'), imageUrl, animationUrl);
    const manifestHash = await uploadToIpfs(Buffer.from(JSON.stringify(manifestJson)));
    await (0, node_fetch_1.default)(`https://ipfs.infura.io:5001/api/v0/pin/add?arg=${manifestHash}`, {
        headers: {
            Authorization: `Basic ${authIFPS}`,
        },
        method: 'POST',
    });
    await sleep(500);
    const link = `https://ipfs.io/ipfs/${manifestHash}`;
    loglevel_1.default.info('uploaded manifest: ', link);
    return [link, imageUrl, animationUrl];
}
exports.ipfsUpload = ipfsUpload;
