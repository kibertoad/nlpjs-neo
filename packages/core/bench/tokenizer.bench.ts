import { test } from 'vitest';
import { longText, shortUtterance, utterances } from '#bench/fixtures/texts.js';
import { microBudget } from '#bench/options.js';
import { Tokenizer } from '../src/index.js';

// Imports are bound to locals: reading them inside a measured loop goes
// through a module runner getter, which shows up in the numbers.
const short = shortUtterance;
const paragraph = longText;
const texts = utterances;

const tokenizer = new Tokenizer();

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
  // `tokenize` memoizes per text, so a repeated utterance measures the cache
  // lookup, while rotating over unseen texts measures the split itself.
  let index = 0;
  await bench.compare(
    bench('cached text', () => {
      tokenizer.tokenize(short);
    }),
    bench('unseen text', () => {
      const cold = new Tokenizer();
      cold.tokenize(texts[index++ % texts.length]);
    }),
    microBudget
  );
});
