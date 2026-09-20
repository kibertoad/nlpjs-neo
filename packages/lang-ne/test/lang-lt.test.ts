import { Container } from '@nlpjs-neo/core';
import { LangNe } from '../src/index.js';

describe('Language Nepali', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangNe);
      const tokenizer = instance.get('tokenizer-ne');
      expect(tokenizer.constructor.name).toEqual('TokenizerNe');
      const stemmer = instance.get('stemmer-ne');
      expect(stemmer.constructor.name).toEqual('StemmerNe');
      const stopwords = instance.get('stopwords-ne');
      expect(stopwords.constructor.name).toEqual('StopwordsNe');
      const normalizer = instance.get('normalizer-ne');
      expect(normalizer.constructor.name).toEqual('NormalizerNe');
    });
  });
});
