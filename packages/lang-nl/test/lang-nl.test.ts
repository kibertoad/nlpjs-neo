import { Container } from '@nlpjs-neo/core';
import { LangNl } from '../src/index.js';

describe('Language Dutch', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangNl);
      const tokenizer = instance.get('tokenizer-nl');
      expect(tokenizer.constructor.name).toEqual('TokenizerNl');
      const stemmer = instance.get('stemmer-nl');
      expect(stemmer.constructor.name).toEqual('StemmerNl');
      const stopwords = instance.get('stopwords-nl');
      expect(stopwords.constructor.name).toEqual('StopwordsNl');
      const normalizer = instance.get('normalizer-nl');
      expect(normalizer.constructor.name).toEqual('NormalizerNl');
    });
  });
});
