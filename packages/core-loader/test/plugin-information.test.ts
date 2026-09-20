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

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import pluginInformation from '../src/plugin-information.json' with { type: 'json' };

const packagesDir = fileURLToPath(new URL('../../', import.meta.url));

/**
 * `lang-ar` -> `LangAr`, `lang-en-min` -> `LangEnMin`.
 */
function toPluginName(dirName: string): string {
  return dirName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * The names a package re-exports from its `src/index.ts`. Read rather than
 * imported, so the check does not pull every language dictionary into the run.
 */
function readExportedNames(dirName: string): string[] {
  const source = readFileSync(`${packagesDir}${dirName}/src/index.ts`, 'utf8');
  return [...source.matchAll(/^\s*([A-Za-z_$][\w$]*),?\s*$/gm)].map(
    (match) => match[1]
  );
}

// The `-min` builds export the same class as their full counterpart, so they
// cannot get a plugin name of their own; they are mounted in code instead.
const languageDirs = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => name.startsWith('lang-') && !name.endsWith('-min'));

describe('Plugin information', () => {
  it('knows every language package', () => {
    expect(languageDirs.length).toBeGreaterThan(0);
    const missing = languageDirs.filter(
      (dirName) => !(toPluginName(dirName) in pluginInformation)
    );
    expect(missing).toEqual([]);
  });

  describe.each(languageDirs)('%s', (dirName) => {
    const pluginName = toPluginName(dirName);

    it('points at the package that holds the plugin', () => {
      expect(pluginInformation[pluginName]).toEqual({
        className: pluginName,
        path: `@nlpjs-neo/${dirName}`,
      });
    });

    it('names a class the package exports', () => {
      expect(readExportedNames(dirName)).toContain(pluginName);
    });
  });
});
