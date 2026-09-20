import fs from 'fs';
import request from './request.js';

function isWeb(str) {
  return (
    typeof str === 'string' &&
    (str.startsWith('https:') || str.startsWith('http:'))
  );
}

function readFile(fileName) {
  return new Promise((resolve) => {
    if (isWeb(fileName)) {
      request(fileName)
        .then((data) => resolve(data))
        .catch(() => resolve(undefined));
    } else {
      try {
        const data = fs.readFileSync(fileName, 'utf8');
        resolve(data);
      } catch {
        resolve(undefined);
      }
    }
  });
}

function writeFile(fileName?, data?, format: fs.WriteFileOptions = 'utf8') {
  return new Promise((resolve, reject) => {
    if (isWeb(fileName)) {
      reject(new Error('File cannot be written in web'));
    } else {
      try {
        fs.writeFile(fileName, data, format, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      } catch (err) {
        reject(err);
      }
    }
  });
}

function existsSync(fileName) {
  return fs.existsSync(fileName);
}

function lstatSync(fileName) {
  return fs.lstatSync(fileName);
}

function readFileSync(fileName, encoding: BufferEncoding = 'utf8') {
  return fs.readFileSync(fileName, encoding);
}

export default {
  readFile,
  writeFile,
  existsSync,
  lstatSync,
  readFileSync,
  name: 'fs',
};
