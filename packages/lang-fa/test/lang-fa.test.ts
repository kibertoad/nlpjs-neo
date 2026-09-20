import { Container } from '@nlpjs-neo/core';
import { LangFa } from '../src/index.js';

describe('Language Farsi', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangFa);
      const tokenizer = instance.get('tokenizer-fa');
      expect(tokenizer.constructor.name).toEqual('TokenizerFa');
      const stemmer = instance.get('stemmer-fa');
      expect(stemmer.constructor.name).toEqual('StemmerFa');
      const stopwords = instance.get('stopwords-fa');
      expect(stopwords.constructor.name).toEqual('StopwordsFa');
      const normalizer = instance.get('normalizer-fa');
      expect(normalizer.constructor.name).toEqual('NormalizerFa');
    });
  });
});
