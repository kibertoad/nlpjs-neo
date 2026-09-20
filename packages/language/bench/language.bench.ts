import { test } from 'vitest';
import {
  accentedUtterance,
  longText,
  shortUtterance,
} from '#bench/fixtures/texts.js';
import { microBudget } from '#bench/options.js';
import { Language } from '../src/index.js';

const short = shortUtterance;
const spanish = accentedUtterance;
const paragraph = longText;

const language = new Language();

// Guessing scores the trigrams of the utterance against every model of the
// detected script, so an allowlist is what keeps the cost down. `Nlp#process`
// pays this whenever it is called without a locale.
test('Language#guess', async ({ bench }) => {
  await bench.compare(
    bench('utterance, every language', () => {
      language.guess(short);
    }),
    bench('utterance, allowlist of two', () => {
      language.guess(short, ['en', 'es']);
    }),
    bench('paragraph, every language', () => {
      language.guess(paragraph);
    }),
    microBudget
  );
});

test('Language#guessBest', async ({ bench }) => {
  await bench.compare(
    bench('english utterance', () => {
      language.guessBest(short);
    }),
    bench('spanish utterance', () => {
      language.guessBest(spanish);
    }),
    microBudget
  );
});
