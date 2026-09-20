import { expect, test } from 'vitest';
import corpus from '#bench/fixtures/corpus-en.json' with { type: 'json' };
import { pipelineBudget, trainingBudget } from '#bench/options.js';
import { LangEn } from '../../lang-en/src/index.js';
import { Nlp } from '../src/index.js';

/** The utterances the corpus keeps aside, none of which the model was trained on. */
const testUtterances = corpus.data.flatMap((intent) => intent.tests);

async function buildNlp() {
  // `autoSave` writes the model to disk after every training run, which the
  // benchmark has no use for, and the neural log prints one line per epoch.
  const nlp = new Nlp({
    languages: ['en'],
    threshold: 0.5,
    autoSave: false,
    nlu: { log: false },
  });
  nlp.use(LangEn);
  await nlp.addCorpus(structuredClone(corpus));
  return nlp;
}

const nlp = await buildNlp();
await nlp.train();

// The whole pipeline for one utterance: normalize, tokenize, stem, extract
// entities, classify, pick an answer. This is what a chatbot pays per message.
test('Nlp#process', async ({ bench }) => {
  // The benchmark is only meaningful while the model still answers, so the
  // pipeline is checked once before it is measured.
  const sample = await nlp.process('en', testUtterances[0]);
  expect(sample.intent).toEqual(corpus.data[0].intent);

  let index = 0;
  await bench.compare(
    bench('unseen utterance', async () => {
      await nlp.process('en', testUtterances[index++ % testUtterances.length]);
    }),
    bench('utterance of unknown words', async () => {
      await nlp.process('en', 'qwerty uiop asdfgh jklzxcv bnm');
    }),
    pipelineBudget
  );
});

// Training is offline work, but it gates every change to a corpus, so a
// regression here is felt by everyone editing intents.
test('Nlp#train', async ({ bench }) => {
  let untrained = await buildNlp();
  await bench(
    'corpus of 51 intents',
    {
      afterEach: async () => {
        untrained = await buildNlp();
      },
    },
    async () => {
      await untrained.train();
    }
  ).run(trainingBudget);
});
