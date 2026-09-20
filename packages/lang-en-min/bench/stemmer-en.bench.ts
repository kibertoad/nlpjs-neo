import { test } from 'vitest';
import { longText, tokens } from '#bench/fixtures/texts.js';
import { microBudget } from '#bench/options.js';
import { StemmerEn } from '../src/index.js';

const words = tokens;
const paragraph = longText;

const stemmer = new StemmerEn();

test('StemmerEn#stem', async ({ bench }) => {
  // Every stemmed word is memoized, so the cold path has to start from an
  // empty cache. The reset runs in `beforeEach`, outside the measured call.
  await bench.compare(
    bench('tokenized utterance, warm cache', () => {
      stemmer.stem(words);
    }),
    bench(
      'tokenized utterance, cold cache',
      {
        beforeEach: () => {
          stemmer.cache = {};
        },
      },
      () => {
        stemmer.stem(words);
      }
    ),
    microBudget
  );
});

test('StemmerEn#tokenizeAndStem', async ({ bench }) => {
  await bench(
    'paragraph, cold cache',
    {
      beforeEach: () => {
        stemmer.cache = {};
      },
    },
    () => {
      stemmer.tokenizeAndStem(paragraph);
    }
  ).run(microBudget);
});
