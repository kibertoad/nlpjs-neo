import { test } from 'vitest';
import {
  longText,
  mediumUtterance,
  shortUtterance,
} from '#bench/fixtures/texts.js';
import { microBudget } from '#bench/options.js';
import { TokenizerEn } from '../src/index.js';

const short = shortUtterance;
const contracted = mediumUtterance;
const paragraph = longText;

const tokenizer = new TokenizerEn();

// The English tokenizer expands contractions with eight regular expressions
// before splitting, which is what separates it from the generic one.
test('TokenizerEn#innerTokenize', async ({ bench }) => {
  await bench.compare(
    bench('short utterance', () => {
      tokenizer.innerTokenize(short);
    }),
    bench('utterance with contractions', () => {
      tokenizer.innerTokenize(contracted);
    }),
    bench('paragraph', () => {
      tokenizer.innerTokenize(paragraph);
    }),
    microBudget
  );
});
