"use strict";
exports.__esModule = true;
exports.download = void 0;
var https_1 = require("https");
var fs_1 = require("fs");
var download = function (url, dest) {
    return new Promise(function (resolve, reject) {
        // Check file does not exist yet before hitting network
        fs_1["default"].access(dest, fs_1["default"].constants.F_OK, function (err) {
            if (err === null)
                reject('File already exists');
            var request = https_1["default"].get(url, function (response) {
                if (response.statusCode === 200) {
                    var file_1 = fs_1["default"].createWriteStream(dest, { flags: 'wx' });
                    file_1.on('finish', function () { return resolve(); });
                    file_1.on('error', function (err) {
                        file_1.close();
                        if (err.code === 'EEXIST')
                            reject('File already exists');
                        else
                            fs_1["default"].unlink(dest, function () { return reject(err.message); }); // Delete temp file
                    });
                    response.pipe(file_1);
                }
                else if (response.statusCode === 302 || response.statusCode === 301) {
                    //Recursively follow redirects, only a 200 will resolve.
                    (0, exports.download)(response.headers.location, dest).then(function () { return resolve(); });
                }
                else {
                    reject("Server responded with ".concat(response.statusCode, ": ").concat(response.statusMessage));
                }
            });
            request.on('error', function (err) {
                reject(err.message);
            });
        });
    });
};
exports.download = download;
