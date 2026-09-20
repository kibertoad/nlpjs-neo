import { containerBootstrap } from '@nlpjs-neo/core';
import { expect, test } from 'vitest';
import { longText } from '#bench/fixtures/texts.js';
import { pipelineBudget } from '#bench/options.js';
import { LangEn } from '../../lang-en/src/index.js';
import { SentimentAnalyzer } from '../src/index.js';

const paragraph = longText;

const container = containerBootstrap();
container.use(LangEn);
container.registerPipeline(
  'sentiment-??-prepare',
  ['normalize', 'tokenize', 'arrToObj', 'output.tokens'],
  false
);

const analyzer = new SentimentAnalyzer({ container });

// Sentiment runs on every utterance that goes through `Nlp#process`: the text
// is tokenized again and every token looked up in the AFINN dictionary.
test('SentimentAnalyzer#process', async ({ bench }) => {
  // A missing dictionary would score nothing at all, and score it quickly, so
  // the lookup is checked once before it is measured.
  const sample = await analyzer.process({
    locale: 'en',
    utterance: 'I love this application, the support is great',
  });
  expect(sample.sentiment.numHits).toBeGreaterThan(0);

  await bench.compare(
    bench('positive utterance', async () => {
      await analyzer.process({
        locale: 'en',
        utterance: 'I love this application, the support is great',
      });
    }),
    bench('neutral utterance', async () => {
      await analyzer.process({
        locale: 'en',
        utterance: 'what is the name of your application',
      });
    }),
    bench('paragraph', async () => {
      await analyzer.process({ locale: 'en', utterance: paragraph });
    }),
    pipelineBudget
  );
});
