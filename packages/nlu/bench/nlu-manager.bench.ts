import { containerBootstrap } from '@nlpjs-neo/core';
import { expect, test } from 'vitest';
import { clearUtteranceCaches } from '#bench/caches.js';
import corpus from '#bench/fixtures/corpus-en.json' with { type: 'json' };
import { pipelineBudget, trainingBudget } from '#bench/options.js';
import { LangEn } from '../../lang-en/src/index.js';
import { NluManager, NluNeural } from '../src/index.js';

/** The utterances the corpus keeps aside, none of which the model was trained on. */
const testUtterances = corpus.data.flatMap((intent) => intent.tests);

function buildManager() {
  const container = containerBootstrap();
  container.use(NluNeural);
  container.use(LangEn);
  // `log` prints one line per training epoch, which the benchmark does not need.
  const manager = new NluManager({ container, locales: ['en'], log: false });
  for (const intent of corpus.data) {
    for (const utterance of intent.utterances) {
      manager.add('en', utterance, intent.intent);
    }
  }
  return manager;
}

const manager = buildManager();
await manager.train();

// Classification without the entity extraction and answer selection that
// `Nlp#process` adds on top: normalize, tokenize, stem, look up features,
// run the network and normalize the classifications.
test('NluManager#process', async ({ bench }) => {
  // The benchmark is only meaningful while the model still classifies, so the
  // pipeline is checked once before it is measured.
  const sample = await manager.process('en', testUtterances[0]);
  expect(sample.intent).toEqual(corpus.data[0].intent);

  // The prepare step memoizes its tokens per utterance, so without a reset the
  // rotation below would measure that memo rather than the pipeline. It is
  // emptied per iteration, in the untimed `beforeEach` hook.
  const coldPath = { beforeEach: () => clearUtteranceCaches(manager) };

  let index = 0;
  await bench.compare(
    bench('unseen utterance', coldPath, async () => {
      await manager.process(
        'en',
        testUtterances[index++ % testUtterances.length]
      );
    }),
    bench('utterance of unknown words', coldPath, async () => {
      await manager.process('en', 'qwerty uiop asdfgh jklzxcv bnm');
    }),
    pipelineBudget
  );
});

test('NluManager#train', async ({ bench }) => {
  let untrained = buildManager();
  await bench(
    'corpus of 51 intents',
    {
      afterEach: () => {
        untrained = buildManager();
      },
    },
    async () => {
      await untrained.train();
    }
  ).run(trainingBudget);
});
