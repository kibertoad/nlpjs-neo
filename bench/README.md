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

## Comparing against a baseline

Store a result, then compare a later run against it:

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

`bench/results/` is git-ignored, so baselines stay local.

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
  hook of `bench(name, options, fn)`, which is not timed.
- Assert once, before the benchmark, that the code still does what it is supposed to. A
  pipeline that silently stopped matching anything benchmarks beautifully.
- Reuse the fixtures in `#bench/fixtures/`. `corpus-en.json` is the 51-intent corpus that the
  NLU, NLP and neural benchmarks train on; `texts.ts` holds the utterances, paragraph and token
  lists everything else works from.
