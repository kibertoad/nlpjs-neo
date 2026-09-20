import { Container } from '@nlpjs-neo/core';
import { LangLt } from '../src/index.js';

describe('Language Lithuanian', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangLt);
      const tokenizer = instance.get('tokenizer-lt');
      expect(tokenizer.constructor.name).toEqual('TokenizerLt');
      const stemmer = instance.get('stemmer-lt');
      expect(stemmer.constructor.name).toEqual('StemmerLt');
      const stopwords = instance.get('stopwords-lt');
      expect(stopwords.constructor.name).toEqual('StopwordsLt');
      const normalizer = instance.get('normalizer-lt');
      expect(normalizer.constructor.name).toEqual('NormalizerLt');
    });
  });
});
