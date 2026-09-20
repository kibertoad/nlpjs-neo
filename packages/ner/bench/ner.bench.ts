import { containerBootstrap } from '@nlpjs-neo/core';
import { expect, test } from 'vitest';
import { pipelineBudget } from '#bench/options.js';
import { LangEn } from '../../lang-en/src/index.js';
import { Ner } from '../src/index.js';

/**
 * Enum entities are the ones that scale badly: every option is compared
 * against every substring of the utterance, so the option count is what the
 * extractor pays for. Two sizes are measured to make that visible.
 */
const prefixes = [
  'north',
  'south',
  'east',
  'west',
  'new',
  'old',
  'upper',
  'lower',
  'great',
  'little',
];
const suffixes = [
  'field',
  'ville',
  'town',
  'bridge',
  'ford',
  'port',
  'wood',
  'hill',
  'water',
  'stone',
];

function cityNames(count: number) {
  const names: string[] = [];
  for (const prefix of prefixes) {
    for (const suffix of suffixes) {
      names.push(`${prefix}${suffix}`);
      names.push(`${prefix} ${suffix} city`);
    }
  }
  return names.slice(0, count);
}

function buildNer(optionCount: number) {
  const container = containerBootstrap();
  container.use(LangEn);
  const ner = new Ner({ container });
  for (const name of cityNames(optionCount)) {
    ner.addRuleOptionTexts('en', 'city', name, [name]);
  }
  ner.addRegexRule('en', 'email', /\b[\w.-]+@[\w.-]+\.\w{2,}\b/gi);
  ner.addBetweenCondition('en', 'quoted', 'named', 'please');
  return ner;
}

const smallNer = buildNer(20);
const largeNer = buildNer(200);

const exactMatch = {
  locale: 'en',
  text: 'I want a flight to northfield tomorrow morning',
};
const fuzzyMatch = {
  locale: 'en',
  text: 'I want a flight to nortfield tomorow morning',
};
const noMatch = {
  locale: 'en',
  text: 'I want to know the price of the subscription',
};

test('Ner#process, 20 enum options', async ({ bench }) => {
  // Extracting nothing would be much faster and much less interesting, so the
  // rules are checked once before they are measured.
  const sample = await smallNer.process({ ...fuzzyMatch });
  expect(sample.entities[0].entity).toEqual('city');

  await bench.compare(
    bench('exact match', async () => {
      await smallNer.process({ ...exactMatch });
    }),
    bench('fuzzy match', async () => {
      await smallNer.process({ ...fuzzyMatch });
    }),
    bench('no match', async () => {
      await smallNer.process({ ...noMatch });
    }),
    pipelineBudget
  );
});

test('Ner#process, 200 enum options', async ({ bench }) => {
  // Checked here too: a rule set that grew past the point of matching anything
  // would report a speedup rather than a failure.
  const sample = await largeNer.process({ ...fuzzyMatch });
  expect(sample.entities[0].entity).toEqual('city');

  await bench.compare(
    bench('exact match', async () => {
      await largeNer.process({ ...exactMatch });
    }),
    bench('fuzzy match', async () => {
      await largeNer.process({ ...fuzzyMatch });
    }),
    bench('no match', async () => {
      await largeNer.process({ ...noMatch });
    }),
    pipelineBudget
  );
});
