import { Container } from '@nlpjs-neo/core';
import { LangIt } from '../src/index.js';

describe('Language Italian', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangIt);
      const tokenizer = instance.get('tokenizer-it');
      expect(tokenizer.constructor.name).toEqual('TokenizerIt');
      const stemmer = instance.get('stemmer-it');
      expect(stemmer.constructor.name).toEqual('StemmerIt');
      const stopwords = instance.get('stopwords-it');
      expect(stopwords.constructor.name).toEqual('StopwordsIt');
      const normalizer = instance.get('normalizer-it');
      expect(normalizer.constructor.name).toEqual('NormalizerIt');
    });
  });
});
