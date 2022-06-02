"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setImageUrlManifest = void 0;
/**
 * Set an asset's manifest from the filesystem & update it with the link
 * to the asset's image/animation link, obtained from signing the asset image/animation DataItem.
 *  Original function getUpdatedManifest from arweave-bundle
 */
async function setImageUrlManifest(manifestString, imageLink, animationLink) {
    const manifest = JSON.parse(manifestString);
    const originalImage = manifest.image;
    manifest.image = imageLink;
    manifest.properties.files.forEach(file => {
        if (file.uri === originalImage)
            file.uri = imageLink;
    });
    if (animationLink) {
        manifest.animation_url = animationLink;
    }
    return manifest;
}
exports.setImageUrlManifest = setImageUrlManifest;
