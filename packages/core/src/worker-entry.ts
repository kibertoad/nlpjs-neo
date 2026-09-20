/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import fs from 'fs';
import path from 'path';

/**
 * Resolves the file to hand to a `worker_threads` Worker.
 *
 * Node spawns workers itself, so it has to be given plain JavaScript: the file
 * sitting next to the compiled module when a package runs from `dist/`, and the
 * compiled file under `dist/` when it runs straight from the TypeScript
 * sources, as tests and `tsx` do.
 *
 * @param {string} moduleDir `import.meta.dirname` of the module spawning the worker.
 * @param {string} entry File name of the worker entry point, for example `worker.js`.
 * @returns {string} Absolute path of the worker entry point.
 */
function resolveWorkerEntry(moduleDir: string, entry: string): string {
  const sibling = path.join(moduleDir, entry);
  if (fs.existsSync(sibling)) {
    return sibling;
  }
  const compiled = path.join(moduleDir, '..', 'dist', entry);
  if (fs.existsSync(compiled)) {
    return compiled;
  }
  throw new Error(
    `Worker entry point not found at ${sibling} or ${compiled}; build the package first.`
  );
}

export default resolveWorkerEntry;
