import { test } from 'vitest';
import {
  accentedUtterance,
  longText,
  shortUtterance,
} from '#bench/fixtures/texts.js';
import { microBudget } from '#bench/options.js';
import { Normalizer } from '../src/index.js';

const short = shortUtterance;
const accented = accentedUtterance;
const paragraph = longText;

const normalizer = new Normalizer();

// Normalization runs on every utterance before anything else does, and its
// cost depends on whether the text carries combining marks to strip.
test('Normalizer#normalize', async ({ bench }) => {
  await bench.compare(
    bench('ascii utterance', () => {
      normalizer.normalize(short);
    }),
    bench('accented utterance', () => {
      normalizer.normalize(accented);
    }),
    bench('ascii paragraph', () => {
      normalizer.normalize(paragraph);
    }),
    microBudget
  );
});
