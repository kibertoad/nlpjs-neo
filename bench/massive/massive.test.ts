/**
 * End-to-end measure of the NLU on a corpus of thousands of utterances, the
 * Amazon MASSIVE dataset (https://github.com/alexa/massive), which the regular
 * benchmarks are too small to stand in for: 60 intents and 11,514 training
 * utterances per language, 2,974 test ones.
 *
 * It is off by default. Point `MASSIVE_DIR` at a folder with `corpus-en.json`
 * and `corpus-es.json` (`{ data: [{ intent, utterances, tests }] }`) and run
 * `pnpm bench:massive`. `MASSIVE_PROFILE` a file for a CPU profile of the runs, `MASSIVE_OUT` a file to write the result to, and
 * `MASSIVE_LOCALES` (`en,es`) limits the languages and `MASSIVE_BASELINE` one written by an earlier run to compare it with: the
 * answers (intent, and score to 1e-4) must be the same, only the times move.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { Session } from 'node:inspector';
import { containerBootstrap } from '@nlpjs-neo/core';
import { expect, test } from 'vitest';
import { clearUtteranceCaches } from '#bench/caches.js';
import { LangEn } from '../../packages/lang-en/src/index.js';
import { LangEs } from '../../packages/lang-es/src/index.js';
import { NluManager, NluNeural } from '../../packages/nlu/src/index.js';

interface Corpus {
  data: { intent: string; utterances: string[]; tests: string[] }[];
}

interface Outcome {
  locale: string;
  trainMs: number;
  accuracy: number;
  /** Utterances per second, from the second pass on (the first one warms up). */
  perSecond: number;
  /** Intent and score of every test utterance. */
  answers: [string, number][];
}

const dir = process.env.MASSIVE_DIR;
const seconds = Number(process.env.MASSIVE_SECONDS ?? 8);
const only = process.env.MASSIVE_LOCALES?.split(',');

const languages = [
  ['en', LangEn],
  ['es', LangEs],
] as const;

async function measure(
  locale: string,
  Lang: (typeof languages)[number][1]
): Promise<Outcome> {
  const corpus = JSON.parse(
    readFileSync(`${dir}/corpus-${locale}.json`, 'utf8')
  ) as Corpus;
  const container = containerBootstrap();
  container.use(NluNeural);
  container.use(Lang);
  const manager = new NluManager({ container, locales: [locale], log: false });
  for (const { intent, utterances } of corpus.data) {
    for (const utterance of utterances) {
      manager.add(locale, utterance, intent);
    }
  }
  const started = performance.now();
  await manager.train();
  const trainMs = performance.now() - started;

  const tests = corpus.data.flatMap(({ intent, tests: texts }) =>
    texts.map((text) => ({ intent, text }))
  );
  const answers: [string, number][] = [];
  let good = 0;
  for (const { intent, text } of tests) {
    const { classifications } = (await manager.process(locale, text)) as {
      classifications: { intent: string; score: number }[];
    };
    answers.push([classifications[0].intent, classifications[0].score]);
    if (classifications[0].intent === intent) {
      good += 1;
    }
  }

  // `MASSIVE_PROFILE` names a file for the CPU profile of the passes below.
  const session = new Session();
  if (process.env.MASSIVE_PROFILE) {
    session.connect();
    session.post('Profiler.enable');
    session.post('Profiler.start');
  }

  // Every pass starts from empty memos, so it measures the pipeline and not
  // the cache; the words stay stemmed, as they do in a running process.
  let utterances = 0;
  let elapsed = 0;
  let passes = 0;
  while (elapsed < seconds * 1000 || passes < 2) {
    clearUtteranceCaches(manager as never);
    const start = performance.now();
    for (const { text } of tests) {
      await manager.process(locale, text);
    }
    const took = performance.now() - start;
    passes += 1;
    if (passes > 1) {
      elapsed += took;
      utterances += tests.length;
    }
  }
  if (process.env.MASSIVE_PROFILE) {
    session.post('Profiler.stop', (_error, { profile }) => {
      writeFileSync(
        process.env.MASSIVE_PROFILE as string,
        JSON.stringify(profile)
      );
    });
    session.disconnect();
  }
  return {
    locale,
    trainMs,
    accuracy: (good * 100) / tests.length,
    perSecond: (utterances * 1000) / elapsed,
    answers,
  };
}

/**
 * Every answer of a run that moved against a baseline one, or a single line
 * when the two runs do not answer the same utterances: a baseline taken on
 * another corpus, or another split of it, is not comparable, and saying so
 * beats reading a mismatch as thousands of moved answers.
 */
function compareAnswers(outcome: Outcome, before: Outcome): string[] {
  if (before.answers.length !== outcome.answers.length) {
    return [
      `${outcome.locale}: the baseline answers ${before.answers.length} utterances and this run ${outcome.answers.length}, so they are not comparable`,
    ];
  }
  return outcome.answers
    .map(([intent, score], at) => {
      const [was, wasScore] = before.answers[at];
      return was !== intent || Math.abs(wasScore - score) > 1e-4
        ? `${outcome.locale} ${at}: ${was} ${wasScore} -> ${intent} ${score}`
        : '';
    })
    .filter(Boolean);
}

test.skipIf(!dir)('MASSIVE corpora', async () => {
  const outcomes: Outcome[] = [];
  for (const [locale, Lang] of languages) {
    if (only && !only.includes(locale)) {
      continue;
    }
    const outcome = await measure(locale, Lang);
    outcomes.push(outcome);
    console.log(
      `${locale}: train ${(outcome.trainMs / 1000).toFixed(2)}s, accuracy ${outcome.accuracy.toFixed(2)}%, ${outcome.perSecond.toFixed(0)} utterances/s`
    );
  }
  if (process.env.MASSIVE_OUT) {
    writeFileSync(process.env.MASSIVE_OUT, JSON.stringify(outcomes));
  }
  const moved: string[] = [];
  if (process.env.MASSIVE_BASELINE) {
    const baseline = JSON.parse(
      readFileSync(process.env.MASSIVE_BASELINE, 'utf8')
    ) as Outcome[];
    for (const outcome of outcomes) {
      const before = baseline.find(({ locale }) => locale === outcome.locale);
      if (!before) {
        continue;
      }
      const changed = compareAnswers(outcome, before);
      moved.push(...changed);
      console.log(
        `${outcome.locale}: train ${(outcome.trainMs / before.trainMs).toFixed(2)}x, run ${(outcome.perSecond / before.perSecond).toFixed(2)}x of the baseline, ${changed.length} answers moved`
      );
    }
  }
  expect(moved.slice(0, 5)).toEqual([]);
});
