import { test } from 'vitest';
import { misspelledTokens, tokens } from '#bench/fixtures/texts.js';
import { microBudget } from '#bench/options.js';
import { SpellCheck } from '../src/index.js';

const misspelled = misspelledTokens;
const correct = tokens;

// A feature dictionary the size of a small trained model: the spell checker
// scans every feature whose length is within the edit distance of the token.
const features: Record<string, number> = {};
for (const word of [
  'application',
  'applications',
  'account',
  'beta',
  'cancel',
  'company',
  'connection',
  'contact',
  'crashes',
  'developer',
  'developers',
  'discount',
  'download',
  'downloading',
  'internet',
  'invoice',
  'invoices',
  'password',
  'payment',
  'price',
  'release',
  'reset',
  'subscription',
  'support',
  'version',
]) {
  features[word] = 1;
}

const spellCheck = new SpellCheck({ features });

test('SpellCheck#check', async ({ bench }) => {
  await bench.compare(
    bench('misspelled tokens, distance 1', () => {
      spellCheck.check(misspelled, 1);
    }),
    bench('misspelled tokens, distance 2', () => {
      spellCheck.check(misspelled, 2);
    }),
    bench('known tokens, distance 1', () => {
      spellCheck.check(correct, 1);
    }),
    microBudget
  );
});
