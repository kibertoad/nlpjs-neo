#!/usr/bin/env node
/**
 * Publish-time type and packaging checks for every workspace package.
 *
 * - `attw` verifies that the published `exports` map hands every resolution
 *   mode a type declaration that matches the JavaScript it sits next to. The
 *   `esm-only` profile is used on purpose: these packages ship ESM only, so
 *   the CommonJS resolutions are expected to fail and are not reported.
 * - `publint` catches the rest of the packaging mistakes (missing files,
 *   unresolvable entry points, stale fields).
 *
 * Both tools pack the package first, so this needs `pnpm build` to have run.
 */
import { execFile } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packagesDir = join(root, 'packages');
const CONCURRENCY = 8;

const packages = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(packagesDir, entry.name))
  .filter((dir) => existsSync(join(dir, 'package.json')));

const missingBuild = packages.filter((dir) => !existsSync(join(dir, 'dist')));
if (missingBuild.length > 0) {
  console.error(
    `Missing build output for ${missingBuild.length} package(s), e.g. ` +
      `${relative(root, missingBuild[0])}. Run \`pnpm build\` first.`
  );
  process.exit(1);
}

const bin = (name) => join(root, 'node_modules', '.bin', name);

async function check(dir) {
  const { name } = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  const failures = [];
  const checks = [
    ['attw', [bin('attw'), ['--pack', dir, '--profile', 'esm-only']]],
    ['publint', [bin('publint'), ['run', dir, '--strict']]],
  ];
  for (const [tool, [command, args]] of checks) {
    try {
      await run(command, args, { cwd: root });
    } catch (error) {
      failures.push(`${tool}:\n${error.stdout || error.message}`);
    }
  }
  return { name, failures };
}

const results = [];
const queue = [...packages];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let dir = queue.pop(); dir; dir = queue.pop()) {
      results.push(await check(dir));
    }
  })
);

const failed = results.filter((result) => result.failures.length > 0);
for (const { name, failures } of failed.sort((a, b) =>
  a.name.localeCompare(b.name)
)) {
  console.error(`\n✖ ${name}`);
  for (const failure of failures) console.error(failure);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} of ${results.length} package(s) failed.`);
  process.exit(1);
}
console.log(`✔ attw + publint clean for ${results.length} packages.`);
