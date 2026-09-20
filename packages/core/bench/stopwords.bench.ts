import { test } from 'vitest';
import { tokens } from '#bench/fixtures/texts.js';
import { microBudget } from '#bench/options.js';
import { Stopwords } from '../src/index.js';

const words = tokens;

const stopwords = new Stopwords();
stopwords.build([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'if',
  'in',
  'into',
  'is',
  'it',
  'no',
  'not',
  'of',
  'on',
  'or',
  'such',
  'that',
  'the',
  'their',
  'then',
  'there',
  'these',
  'they',
  'this',
  'to',
  'was',
  'while',
  'with',
]);

test('Stopwords#removeStopwords', async ({ bench }) => {
  await bench('tokenized utterance', () => {
    stopwords.removeStopwords(words);
  }).run(microBudget);
});
