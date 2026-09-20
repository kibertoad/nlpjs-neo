import fs from 'fs';
import path from 'path';

/* oxlint-disable */
const memory = new WebAssembly.Memory({ initial: 2 });
/* oxlint-enable */

const buffer = new Uint8Array(memory.buffer);
const importObject = {
  js: {
    mem: memory,
  },
};

/* oxlint-disable */
const source = fs.readFileSync(
  path.resolve(import.meta.dirname, '../wa/leven.wasm')
);
const mod = new WebAssembly.Module(new Uint8Array(source));
const webAssemblyObj = new WebAssembly.Instance(mod, importObject);
/* oxlint-enable */

function leven(left, right) {
  let idx = 0;

  for (let i = 0; i < left.length; i += 1) {
    buffer[idx] = left[i].charCodeAt(0);
    idx += 1;
  }

  for (let i = 0; i < right.length; i += 1) {
    buffer[idx] = right[i].charCodeAt(0);
    idx += 1;
  }

  return webAssemblyObj.exports.leven(left.length, right.length);
}

export default leven;
