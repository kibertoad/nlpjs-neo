import { test } from 'vitest';
import { clearTokenizerCache } from '#bench/caches.js';
import { longText, shortUtterance } from '#bench/fixtures/texts.js';
import { microBudget } from '#bench/options.js';
import { Tokenizer } from '../src/index.js';

// Imports are bound to locals: reading them inside a measured loop goes
// through a module runner getter, which shows up in the numbers.
const short = shortUtterance;
const paragraph = longText;

const tokenizer = new Tokenizer();
// A second instance for the cold path, so emptying its memo cannot disturb the
// warm benchmark running beside it.
const coldTokenizer = new Tokenizer();

test('Tokenizer#innerTokenize', async ({ bench }) => {
  await bench.compare(
    bench('short utterance', () => {
      tokenizer.innerTokenize(short);
    }),
    bench('paragraph', () => {
      tokenizer.innerTokenize(paragraph);
    }),
    microBudget
  );
});

test('Tokenizer#tokenize', async ({ bench }) => {
  // `tokenize` memoizes per text, so the same utterance measures the cache
  // lookup once it is warm and the split itself once the memo is emptied. The
  // reset runs in `beforeEach`, outside the measured call.
  await bench.compare(
    bench('short utterance, warm cache', () => {
      tokenizer.tokenize(short);
    }),
    bench(
      'short utterance, cold cache',
      {
        beforeEach: () => {
          clearTokenizerCache(coldTokenizer);
        },
      },
      () => {
        coldTokenizer.tokenize(short);
      }
    ),
    microBudget
  );
});
