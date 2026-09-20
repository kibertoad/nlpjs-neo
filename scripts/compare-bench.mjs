#!/usr/bin/env node
/**
 * Compares two benchmark runs produced by Vitest's JSON reporter and reports
 * how the second one moved against the first:
 *
 *   pnpm exec vitest bench --run --reporter=json --outputFile.json=base.json
 *   pnpm exec vitest bench --run --reporter=json --outputFile.json=head.json
 *   node scripts/compare-bench.mjs base.json head.json
 *
 * Benchmarks are matched by file, test and task name. Ones that exist on only
 * one side are listed as added or removed and never fail the comparison.
 *
 * The metric is the median time per operation, which survives the pauses and
 * neighbour noise of a shared runner far better than the mean. A benchmark
 * counts as a regression when it got slower by more than
 * `BENCH_REGRESSION_THRESHOLD` percent (default 30) *and* by more than the
 * combined margin of error of the two runs, so that a benchmark which is
 * simply noisy cannot fail the job on its own. The exit code is 1 if any
 * benchmark regressed that far.
 */
import { readFileSync, appendFileSync } from 'node:fs';

const [baseFile, headFile] = process.argv.slice(2);
if (!baseFile || !headFile) {
  console.error(
    'Usage: node scripts/compare-bench.mjs <base.json> <head.json>'
  );
  process.exit(2);
}

const threshold = Number(process.env.BENCH_REGRESSION_THRESHOLD ?? 30);
if (!Number.isFinite(threshold) || threshold <= 0) {
  console.error(
    `BENCH_REGRESSION_THRESHOLD must be a positive number, got "${process.env.BENCH_REGRESSION_THRESHOLD}".`
  );
  process.exit(2);
}

/**
 * Flattens a JSON report into `name -> measurement`. A report from a run that
 * found no benchmarks at all (a base branch from before they existed) reads as
 * an empty map, which turns the comparison into a list of additions.
 */
function readRun(file) {
  let report;
  try {
    report = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
  const measurements = new Map();
  for (const testFile of report.testResults ?? []) {
    // The report carries absolute paths; the part from `packages/` on is what
    // identifies the benchmark across two checkouts.
    const [, packagePath] = testFile.name.split('/packages/');
    const benchFile = packagePath ? `packages/${packagePath}` : testFile.name;
    for (const assertion of testFile.assertionResults ?? []) {
      for (const benchmark of assertion.benchmarks ?? []) {
        for (const task of benchmark.tasks ?? []) {
          const { latency, throughput } = task;
          measurements.set(`${benchFile} › ${benchmark.name} › ${task.name}`, {
            // `p50` is the median latency in milliseconds; `mean` is only used
            // when a task ran too few samples for percentiles to be reported.
            median: latency.p50 || latency.mean,
            hz: throughput.mean,
            rme: latency.rme,
          });
        }
      }
    }
  }
  return measurements;
}

const base = readRun(baseFile);
const head = readRun(headFile);

if (!head) {
  console.error(`No benchmark report at ${headFile}.`);
  process.exit(2);
}

const rows = [];
for (const [name, current] of head) {
  const previous = base?.get(name);
  if (!previous) {
    rows.push({ name, current, change: undefined, status: 'added' });
    continue;
  }
  const change = ((current.median - previous.median) / previous.median) * 100;
  const noise = previous.rme + current.rme;
  const regressed = change > threshold && change > noise;
  rows.push({
    name,
    previous,
    current,
    change,
    noise,
    status: regressed ? 'regressed' : 'ok',
  });
}
for (const [name, previous] of base ?? []) {
  if (!head.has(name)) {
    rows.push({ name, previous, change: undefined, status: 'removed' });
  }
}

const formatOps = (hz) =>
  hz === undefined ? '—' : `${Math.round(hz).toLocaleString('en-US')} ops/s`;
/** Most of these benchmarks live below a millisecond, so pick a readable unit. */
const formatTime = (ms) =>
  ms < 1 ? `${(ms * 1000).toFixed(2)}µs` : `${ms.toFixed(3)}ms`;
const formatChange = (row) => {
  if (row.status === 'added') return 'new';
  if (row.status === 'removed') return 'gone';
  const sign = row.change > 0 ? '+' : '';
  // The change is measured on latency, so a positive number is slower.
  return `${sign}${row.change.toFixed(1)}%`;
};
const marker = (row) => {
  if (row.status === 'regressed') return '🔴';
  if (row.status === 'added' || row.status === 'removed') return '•';
  if (row.change < -threshold) return '🟢';
  return '⚪';
};

rows.sort((a, b) => (b.change ?? -Infinity) - (a.change ?? -Infinity));

const lines = [
  '| | Benchmark | Base | This branch | Change |',
  '| --- | --- | ---: | ---: | ---: |',
];
for (const row of rows) {
  lines.push(
    `| ${marker(row)} | ${row.name} | ${formatOps(row.previous?.hz)} | ` +
      `${formatOps(row.current?.hz)} | ${formatChange(row)} |`
  );
}

const regressions = rows.filter((row) => row.status === 'regressed');
const summary = base
  ? `${rows.length} benchmark(s) compared, ${regressions.length} regression(s) ` +
    `beyond ${threshold}% slower.`
  : `No benchmarks on the base branch to compare against; listing ${rows.length} new one(s).`;

lines.push('', summary);
if (base) {
  lines.push(
    '',
    'Times are medians of a single run each, measured back to back on the same runner. ' +
      'Treat small moves as noise.'
  );
}

const report = lines.join('\n');
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `## Benchmarks\n\n${report}\n`
  );
}

if (regressions.length > 0) {
  console.error(
    `\n${regressions.length} benchmark(s) got more than ${threshold}% slower:\n` +
      regressions
        .map(
          (row) =>
            `  ${row.name}: ${formatTime(row.previous.median)} → ` +
            `${formatTime(row.current.median)} per operation (+${row.change.toFixed(1)}%)`
        )
        .join('\n')
  );
  process.exit(1);
}
