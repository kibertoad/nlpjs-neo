import { test } from 'vitest';
import { longText, shortUtterance, utterances } from '#bench/fixtures/texts.js';
import { microBudget } from '#bench/options.js';
import { CosineSimilarity } from '../src/index.js';

const short = shortUtterance;
const other = utterances[0];
const paragraph = longText;

const cosineSimilarity = new CosineSimilarity();

// Cosine similarity builds a term frequency map and a vector per call, so the
// cost grows with the combined vocabulary of both texts.
test('CosineSimilarity#similarity', async ({ bench }) => {
  await bench.compare(
    bench('two utterances', () => {
      cosineSimilarity.similarity(short, other);
    }),
    bench('utterance against paragraph', () => {
      cosineSimilarity.similarity(short, paragraph);
    }),
    microBudget
  );
});
