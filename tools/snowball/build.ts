/**
 * Generates the stemmers that are written in Snowball, the ones `stemmers.ts`
 * lists. Run it with `pnpm stemmers` and commit the result. The programs are
 * downloaded the first time (see `sources.ts`).
 *
 * `pnpm stemmers:check` writes nothing and fails when a committed stemmer is
 * not what the tool writes.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, STEMMERS } from './stemmers.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const check = args.includes('--check');
const only = args.filter((arg) => !arg.startsWith('--'));
let stale = 0;

for (const stemmer of STEMMERS) {
  if (only.length > 0 && !only.some((part) => stemmer.out.includes(part))) {
    continue;
  }
  const code = await render(stemmer);
  const file = join(root, stemmer.out);
  if (check) {
    const committed = readFileSync(file, 'utf8').replaceAll('\r\n', '\n');
    if (committed !== code) {
      stale++;
      console.error(`${stemmer.out} is not what the tool writes`);
    }
  } else {
    writeFileSync(file, code);
    console.log(`${stemmer.origin} -> ${stemmer.out}`);
  }
}
if (stale > 0) {
  process.exit(1);
}
