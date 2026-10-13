/**
 * Usage: node tools/snowball/cli.ts <program.sbl> --class StemmerEn --name stemmer-en [--out file.ts]
 */
import { writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { generate } from './generate.ts';
import { parseProgram } from './sbl.ts';

const args = process.argv.slice(2);
const option = (flag: string): string | undefined => {
  const at = args.indexOf(flag);
  return at >= 0 ? args[at + 1] : undefined;
};
const file = args[0];
const className = option('--class');
const name = option('--name');
if (!file || !className || !name) {
  console.error(
    'usage: cli.ts <program.sbl> --class <ClassName> --name <stemmer-name> [--out <file>]'
  );
  process.exit(1);
}
const code = generate(parseProgram(file), {
  className,
  name,
  source: basename(file),
  inheritRegions: !args.includes('--no-inherit'),
});
const out = option('--out');
if (out) {
  writeFileSync(out, code);
} else {
  process.stdout.write(code);
}
