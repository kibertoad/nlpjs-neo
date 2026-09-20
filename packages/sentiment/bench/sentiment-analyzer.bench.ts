import { containerBootstrap } from '@nlpjs-neo/core';
import { expect, test } from 'vitest';
import { clearTokenizerCache } from '#bench/caches.js';
import { longText } from '#bench/fixtures/texts.js';
import { pipelineBudget } from '#bench/options.js';
import { LangEn } from '../../lang-en/src/index.js';
import { SentimentAnalyzer } from '../src/index.js';

const paragraph = longText;

// No prepare pipeline is registered, so the analyzer takes the same default
// path `Nlp` gives it: the English dictionary is stemmed, so the text goes
// through `StemmerEn#tokenizeAndStem` before it is scored.
const container = containerBootstrap();
container.use(LangEn);

const analyzer = new SentimentAnalyzer({ container });
const tokenizer = container.get('tokenizer-en');

// Sentiment runs on every utterance that goes through `Nlp#process`: the text
// is tokenized and stemmed again, and every stem looked up in the dictionary.
test('SentimentAnalyzer#process', async ({ bench }) => {
  // A missing dictionary would score nothing at all, and score it quickly, so
  // the lookup is checked once before it is measured.
  const sample = await analyzer.process({
    locale: 'en',
    utterance: 'I love this application, the support is great',
  });
  expect(sample.sentiment.numHits).toBeGreaterThan(0);
  // The default path is the one being measured; a prepare pipeline registered
  // under a tag the analyzer asks for would silently replace it.
  expect(container.getPipeline('sentiment-analyzer-prepare')).toBeUndefined();

  // Tokenizing is memoized per text, so the same utterance is only tokenized
  // once unless the memo is emptied between iterations. The per-word stemmer
  // cache is left warm, as it is in a process that has been running a while.
  const coldPath = { beforeEach: () => clearTokenizerCache(tokenizer) };

  await bench.compare(
    bench('positive utterance', coldPath, async () => {
      await analyzer.process({
        locale: 'en',
        utterance: 'I love this application, the support is great',
      });
    }),
    bench('neutral utterance', coldPath, async () => {
      await analyzer.process({
        locale: 'en',
        utterance: 'what is the name of your application',
      });
    }),
    bench('paragraph', coldPath, async () => {
      await analyzer.process({ locale: 'en', utterance: paragraph });
    }),
    pipelineBudget
  );
});
