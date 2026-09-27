# Benchmarks

Benchmarks live next to the code they measure, in `packages/<package>/bench/*.bench.ts`, and
share the fixtures and run budgets kept in this directory. They cover the paths that run per
utterance (normalizing, tokenizing, stemming, entity extraction, classification) and the
training that gates every corpus change, so a change in any of them shows up as a number
rather than as a bug report.

## Running them

```shell
pnpm bench                                  # every benchmark, once
pnpm bench packages/similarity              # one package
pnpm bench packages/nlp/bench/nlp.bench.ts  # one file
pnpm bench:watch packages/core              # re-run on change
```

The whole suite takes about a minute. Results print as a table per benchmark: `hz` is
operations per second (higher is better), `rme` the relative margin of error of the mean, and
`samples` how many times the function ran.

## What the numbers mean

Benchmarks run against the TypeScript sources through Vitest's module runner, the same way the
tests do, so the figures are comparable between runs on one machine and are not absolute
throughput of the published build. Compare a branch against the same branch's baseline, never
against numbers from another machine or another day.

Vitest warns when a benchmark reads a module export inside the measured loop, because each read
goes through a getter that costs time. Bind every fixture and every function under test to a
local `const` at the top of the file to keep that out of the measurement. A warning naming a
`src/` module instead means the measured code crosses module boundaries internally, which is
inherent to running the sources and applies equally to every run.

## A big corpus

The corpora of the benchmarks above have 51 intents and a few hundred utterances, too small to
show what training and classifying cost on a real bot. `bench/massive/massive.test.ts` measures
the whole `NluManager` on the [Amazon MASSIVE](https://github.com/alexa/massive) dataset (60
intents, 11,514 training and 2,974 test utterances per language, English and Spanish). It is not
part of `pnpm bench`, and the dataset is not in the repository: convert the `train` and `test`
partitions of `en-US.jsonl` and `es-ES.jsonl` to `corpus-en.json` and `corpus-es.json`
(`{ "data": [{ "intent", "utterances", "tests" }] }`) in a folder of your own, and run:

```shell
MASSIVE_DIR=/path/to/corpora pnpm bench:massive
```

It prints the training time, the accuracy and the utterances answered per second, with the
memos of the prepare step emptied before every pass. `MASSIVE_OUT=file.json` saves the result,
and `MASSIVE_BASELINE=file.json` on a later run compares against it: the times are printed as a
ratio, and the test fails if the intent or the score (to 1e-4) of any utterance moved, so a
speed-up cannot come from answering differently. A baseline taken on another corpus, or another
split of one, answers a different number of utterances; the run says so and fails, rather than
reading the mismatch as moved answers. `MASSIVE_LOCALES=en`, `MASSIVE_SECONDS=8` and
`MASSIVE_PROFILE=file.cpuprofile` (a CPU profile of the passes) narrow or extend it.

## Comparing two runs

`pnpm bench:compare` diffs two JSON reports, matching benchmarks by file, test and task name:

```shell
git switch main
pnpm bench --reporter=json --outputFile.json=bench/results/base.json

git switch -                 # back to your branch
pnpm bench --reporter=json --outputFile.json=bench/results/head.json

pnpm bench:compare bench/results/base.json bench/results/head.json
```

It prints a table of every benchmark with its change, counts anything more than 30% slower as
a regression and exits non-zero when it finds one. `BENCH_REGRESSION_THRESHOLD` changes that
percentage. The comparison is made on median time per operation, which survives noise better
than the mean, and a benchmark whose two runs have margins of error wider than the change
itself is never counted as a regression. Benchmarks that exist on only one side are listed as
new or gone and never fail the comparison.

`bench/results/` is git-ignored, so reports stay local.

To iterate on a single benchmark instead, store its result from the source and compare in
place, which prints both rows in the same table:

```ts
// On the branch you want as the baseline:
await bench('current', { writeResult: 'bench/results/tokenize.json' }, () => {
  tokenizer.tokenize(text);
}).run(microBudget);

// Afterwards, with the change in place:
await bench.compare(
  bench.from('baseline', 'bench/results/tokenize.json'),
  bench('current', () => {
    tokenizer.tokenize(text);
  }),
  microBudget
);
```

## In CI

`.github/workflows/benchmarks.yml` runs only on pull requests labelled `perf`, because it
benchmarks both sides and the numbers only mean something when somebody is reading them.
Adding the label starts a run, and every later push to a labelled pull request refreshes it:
the job benchmarks the branch, checks out the base commit, benchmarks that, and prints the
comparison to the job summary, failing if a benchmark got more than 30% slower.

Both halves run back to back on the same runner, which is what makes the comparison readable
at all — but it is still a shared runner. Use the job to catch the large regressions it is
tuned for, and measure anything finer on your own machine.

## Writing one

```ts
import { test } from 'vitest';
import { shortUtterance } from '#bench/fixtures/texts.js';
import { microBudget } from '#bench/options.js';
import { Tokenizer } from '../src/index.js';

const text = shortUtterance;
const tokenizer = new Tokenizer();

test('Tokenizer#tokenize', async ({ bench }) => {
  await bench('short utterance', () => {
    tokenizer.tokenize(text);
  }).run(microBudget);
});
```

A few conventions keep the suite honest and comparable:

- Name the test after the thing measured (`Class#method`) and the benchmarks after the inputs
  (`short utterance`, `cold cache`), then group related inputs with `bench.compare()` so the
  reporter prints them in one table.
- Pick a budget from `#bench/options.js` rather than inventing one: `microBudget` for work in
  the microsecond range, `pipelineBudget` for a single utterance through a pipeline,
  `trainingBudget` for training a model.
- Keep setup out of the measured function. Anything that has to run per iteration, like
  clearing a cache or rebuilding an untrained model, belongs in the `beforeEach` or `afterEach`
  hook of `bench(name, options, fn)`, which is not timed. Never construct the object under test
  inside the measured function: the numbers then include an allocation and the collection of the
  previous one.
- Measure a cold path by emptying the memo, not by feeding the code new inputs. The library
  memoizes in several places — `Tokenizer` per text, `BaseStemmer` per word, `Nlu` for the whole
  prepare step — so a benchmark that rotates over a fixed set of utterances is served from the
  memo after its first pass over them. `#bench/caches.js` has one helper per memo, meant for a
  `beforeEach` hook; use them rather than reaching into `cache` from the benchmark, so that the
  memos worth clearing stay listed in one place.
- Assert once, before the benchmark, that the code still does what it is supposed to. A
  pipeline that silently stopped matching anything benchmarks beautifully. The same goes for the
  setup around it: a container registration that no longer matches the tag it was meant for
  leaves the benchmark measuring some other path, quietly, so assert that it took effect.
- Reuse the fixtures in `#bench/fixtures/`. `corpus-en.json` is the 51-intent corpus that the
  NLU, NLP and neural benchmarks train on; `texts.ts` holds the utterances, paragraph and token
  lists everything else works from.
