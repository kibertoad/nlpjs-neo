import { test } from 'vitest';
import { longText, shortUtterance } from '#bench/fixtures/texts.js';
import { microBudget } from '#bench/options.js';
import { ExtractorEnum } from '../src/index.js';

const short = shortUtterance;
const paragraph = longText;

const extractor = new ExtractorEnum();

// `Ner#process` spends most of its time here: for every option of every enum
// entity it walks the substrings of the utterance looking for the closest
// match, so these two functions set the ceiling for entity extraction.
test('ExtractorEnum#getWordPositions', async ({ bench }) => {
  await bench.compare(
    bench('utterance', () => {
      extractor.getWordPositions(short);
    }),
    bench('paragraph', () => {
      extractor.getWordPositions(paragraph);
    }),
    microBudget
  );
});

test('ExtractorEnum#getBestSubstring', async ({ bench }) => {
  await bench.compare(
    bench('exact match', () => {
      extractor.getBestSubstring(short, 'your application');
    }),
    bench('fuzzy match', () => {
      extractor.getBestSubstring(short, 'yuor aplication');
    }),
    bench('no match', () => {
      extractor.getBestSubstring(short, 'something entirely unrelated');
    }),
    microBudget
  );
});

test('ExtractorEnum#getBestSubstringList', async ({ bench }) => {
  await bench.compare(
    bench('utterance', () => {
      extractor.getBestSubstringList(short, 'your application');
    }),
    bench('paragraph', () => {
      extractor.getBestSubstringList(paragraph, 'the application');
    }),
    microBudget
  );
});
