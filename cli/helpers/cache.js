"use strict";
exports.__esModule = true;
exports.saveCache = exports.loadCache = exports.cachePath = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var constants_1 = require("./constants");
function cachePath(env, cacheName, cPath, legacy) {
    if (cPath === void 0) { cPath = constants_1.CACHE_PATH; }
    if (legacy === void 0) { legacy = false; }
    var filename = "".concat(env, "-").concat(cacheName);
    return path_1["default"].join(cPath, legacy ? filename : "".concat(filename, ".json"));
}
exports.cachePath = cachePath;
function loadCache(cacheName, env, cPath, legacy) {
    if (cPath === void 0) { cPath = constants_1.CACHE_PATH; }
    if (legacy === void 0) { legacy = false; }
    var path = cachePath(env, cacheName, cPath, legacy);
    if (!fs_1["default"].existsSync(path)) {
        if (!legacy) {
            return loadCache(cacheName, env, cPath, true);
        }
        return undefined;
    }
    return JSON.parse(fs_1["default"].readFileSync(path).toString());
}
exports.loadCache = loadCache;
function saveCache(cacheName, env, cacheContent, cPath) {
    if (cPath === void 0) { cPath = constants_1.CACHE_PATH; }
    cacheContent.env = env;
    cacheContent.cacheName = cacheName;
    fs_1["default"].writeFileSync(cachePath(env, cacheName, cPath), JSON.stringify(cacheContent));
}
exports.saveCache = saveCache;
