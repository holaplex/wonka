"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.awsUpload = void 0;
const loglevel_1 = __importDefault(require("loglevel"));
const path_1 = require("path");
const fs_1 = require("fs");
const client_s3_1 = require("@aws-sdk/client-s3");
const path_2 = __importDefault(require("path"));
const mime_1 = require("mime");
const file_uri_1 = require("./file-uri");
async function uploadFile(s3Client, awsS3Bucket, filename, contentType, body) {
    const mediaUploadParams = {
        Bucket: awsS3Bucket,
        Key: filename,
        Body: body,
        ACL: 'public-read',
        ContentType: contentType,
    };
    try {
        await s3Client.send(new client_s3_1.PutObjectCommand(mediaUploadParams));
        loglevel_1.default.info('uploaded filename:', filename);
    }
    catch (err) {
        loglevel_1.default.info('Error', err);
    }
    const url = `https://${awsS3Bucket}.s3.amazonaws.com/${filename}`;
    loglevel_1.default.debug('Location:', url);
    return url;
}
async function awsUpload(awsS3Bucket, image, animation, manifestBuffer) {
    const REGION = 'us-east-1'; // TODO: Parameterize this.
    const s3Client = new client_s3_1.S3Client({ region: REGION });
    async function uploadMedia(media) {
        const mediaPath = `assets/${(0, path_1.basename)(media)}`;
        loglevel_1.default.debug('media:', media);
        loglevel_1.default.debug('mediaPath:', mediaPath);
        const mediaFileStream = (0, fs_1.createReadStream)(media);
        const mediaUrl = await uploadFile(s3Client, awsS3Bucket, mediaPath, (0, mime_1.getType)(media), mediaFileStream);
        return mediaUrl;
    }
    // Copied from ipfsUpload
    const imageUrl = `${await uploadMedia(image)}?ext=${path_2.default
        .extname(image)
        .replace('.', '')}`;
    const animationUrl = animation
        ? `${await uploadMedia(animation)}?ext=${path_2.default
            .extname(animation)
            .replace('.', '')}`
        : undefined;
    const manifestJson = await (0, file_uri_1.setImageUrlManifest)(manifestBuffer.toString('utf8'), imageUrl, animationUrl);
    const updatedManifestBuffer = Buffer.from(JSON.stringify(manifestJson));
    const extensionRegex = new RegExp(`${path_2.default.extname(image)}$`);
    const metadataFilename = image.replace(extensionRegex, '.json');
    const metadataUrl = await uploadFile(s3Client, awsS3Bucket, metadataFilename, 'application/json', updatedManifestBuffer);
    return [metadataUrl, imageUrl, animationUrl];
}
exports.awsUpload = awsUpload;
