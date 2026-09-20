import { Container } from '@nlpjs-neo/core';
import { LangHi } from '../src/index.js';

describe('Language Hindi', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangHi);
      const tokenizer = instance.get('tokenizer-hi');
      expect(tokenizer.constructor.name).toEqual('TokenizerHi');
      const stemmer = instance.get('stemmer-hi');
      expect(stemmer.constructor.name).toEqual('StemmerHi');
      const stopwords = instance.get('stopwords-hi');
      expect(stopwords.constructor.name).toEqual('StopwordsHi');
      const normalizer = instance.get('normalizer-hi');
      expect(normalizer.constructor.name).toEqual('NormalizerHi');
    });
  });
});
