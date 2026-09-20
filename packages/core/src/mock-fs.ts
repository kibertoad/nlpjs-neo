/**
 * Stand-in for `node:fs` in the browser bundles: reads resolve empty and
 * writes are rejected.
 */
function readFile(): Promise<undefined> {
  return new Promise((resolve) => {
    resolve(undefined);
  });
}

function writeFile(): Promise<never> {
  return new Promise((resolve, reject) => {
    reject(new Error('File cannot be written in web'));
  });
}

function existsSync(): boolean {
  return false;
}

function lstatSync(): undefined {
  return undefined;
}

function readFileSync(): undefined {
  return undefined;
}

export default {
  readFile,
  writeFile,
  existsSync,
  lstatSync,
  readFileSync,
  name: 'fs',
};
