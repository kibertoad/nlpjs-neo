import { test } from 'vitest';
import { microBudget } from '#bench/options.js';
import { leven, similarity } from '../src/index.js';

const distance = leven;
const normalizedSimilarity = similarity;

// Levenshtein distance is the inner loop of spell checking and of the enum
// entity extractor, so it runs thousands of times per utterance. Its cost
// depends on how early the common prefix and suffix trimming can bail out.
test('leven', async ({ bench }) => {
  await bench.compare(
    bench('identical words', () => {
      distance('application', 'application');
    }),
    bench('one edit apart', () => {
      distance('application', 'aplication');
    }),
    bench('unrelated words', () => {
      distance('application', 'subscription');
    }),
    bench('unrelated sentences', () => {
      distance(
        'where can I download the latest version',
        'when is the next release coming out'
      );
    }),
    microBudget
  );
});

test('similarity', async ({ bench }) => {
  await bench.compare(
    bench('one edit apart', () => {
      normalizedSimilarity('application', 'aplication');
    }),
    bench('one edit apart, normalizing', () => {
      normalizedSimilarity('Aplicación', 'aplicacion', true);
    }),
    microBudget
  );
});
