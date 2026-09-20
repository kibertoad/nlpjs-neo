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
