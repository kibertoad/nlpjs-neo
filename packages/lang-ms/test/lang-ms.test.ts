import { Container } from '@nlpjs-neo/core';
import { LangMs, SentimentMs } from '../src/index.js';

describe('Language Malay', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangMs);
      const tokenizer = instance.get('tokenizer-ms');
      expect(tokenizer.constructor.name).toEqual('TokenizerMs');
      const stemmer = instance.get('stemmer-ms');
      expect(stemmer.constructor.name).toEqual('StemmerMs');
      const stopwords = instance.get('stopwords-ms');
      expect(stopwords.constructor.name).toEqual('StopwordsMs');
      const normalizer = instance.get('normalizer-ms');
      expect(normalizer.constructor.name).toEqual('NormalizerMs');
    });
  });

  describe('Sentiment', () => {
    test('Exports Malay sentiment dictionaries', () => {
      expect(SentimentMs.afinn).toBeDefined();
    });
  });
});
