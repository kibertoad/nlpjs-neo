import { Container } from '@nlpjs-neo/core';
import { LangTl } from '../src/index.js';

describe('Language Tagalog', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangTl);
      const tokenizer = instance.get('tokenizer-tl');
      expect(tokenizer.constructor.name).toEqual('TokenizerTl');
      const stemmer = instance.get('stemmer-tl');
      expect(stemmer.constructor.name).toEqual('StemmerTl');
      const stopwords = instance.get('stopwords-tl');
      expect(stopwords.constructor.name).toEqual('StopwordsTl');
      const normalizer = instance.get('normalizer-tl');
      expect(normalizer.constructor.name).toEqual('NormalizerTl');
    });
  });
});
