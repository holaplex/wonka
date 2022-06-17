import path from 'path';
import yauzl from 'yauzl';
import mkdirp from 'mkdirp';
import fs from 'fs';

export const unzip = (zipPath: string, unzipToDir: string) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // Create folder if not exists
      await mkdirp(unzipToDir);

      // Same as example we open the zip.
      yauzl.open(zipPath, { lazyEntries: true }, (err, zipFile) => {
        if (err) {
          zipFile.close();
          reject(err);
          return;
        }

        zipFile.readEntry();

        zipFile.on('entry', (entry) => {
          try {
            if (/\/$/.test(entry.fileName)) {
              mkdirp.sync(path.join(unzipToDir, entry.fileName));
              zipFile.readEntry();
            } else {
              zipFile.openReadStream(entry, (readErr, readStream) => {
                if (readErr) {
                  zipFile.close();
                  reject(readErr);
                  return;
                }

                const file = fs.createWriteStream(
                  path.join(unzipToDir, entry.fileName),
                );
                readStream.pipe(file);
                file.on('finish', () => {
                  // Wait until the file is finished writing, then read the next entry.
                  file.close(() => {
                    zipFile.readEntry();
                  });

                  file.on('error', (err) => {
                    zipFile.close();
                    reject(err);
                  });
                });
              });
            }
          } catch (e) {
            zipFile.close();
            reject(e);
          }
        });
        zipFile.on('end', (err) => {
          resolve();
        });
        zipFile.on('error', (err) => {
          zipFile.close();
          reject(err);
        });
      });
    } catch (e) {
      reject(e);
    }
  });
};
