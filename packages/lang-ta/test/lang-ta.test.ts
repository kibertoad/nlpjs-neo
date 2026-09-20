import { Container } from '@nlpjs-neo/core';
import { LangTa } from '../src/index.js';

describe('Language Tamil', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangTa);
      const tokenizer = instance.get('tokenizer-ta');
      expect(tokenizer.constructor.name).toEqual('TokenizerTa');
      const stemmer = instance.get('stemmer-ta');
      expect(stemmer.constructor.name).toEqual('StemmerTa');
      const stopwords = instance.get('stopwords-ta');
      expect(stopwords.constructor.name).toEqual('StopwordsTa');
      const normalizer = instance.get('normalizer-ta');
      expect(normalizer.constructor.name).toEqual('NormalizerTa');
    });
  });
});
