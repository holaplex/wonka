import https from 'https';
import http from 'http';
import fs from 'fs';

export const download = (url: string, dest: string) =>
  new Promise<void>((resolve, reject) => {
    // Check file does not exist yet before hitting network
    fs.access(dest, fs.constants.F_OK, (err) => {
      if (err === null) reject('File already exists');

      const responseHandler = (response: http.IncomingMessage): void => {
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(dest, { flags: 'wx' });
          file.on('finish', () => resolve());
          file.on('error', (err: any) => {
            file.close();
            if (err.code === 'EEXIST') reject('File already exists');
            else fs.unlink(dest, () => reject(err.message)); // Delete temp file
          });
          response.pipe(file);
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          //Recursively follow redirects, only a 200 will resolve.
          download(response.headers.location, dest).then(() => resolve());
        } else {
          reject(
            `Server responded with ${response.statusCode}: ${response.statusMessage}`,
          );
        }
      };

      let request: http.ClientRequest;
      if (url.startsWith('https')) {
        request = https.get(url, responseHandler);
      } else {
        request = http.get(url, responseHandler);
      }

      request.on('error', (err) => {
        reject(err.message);
      });
    });
  });
