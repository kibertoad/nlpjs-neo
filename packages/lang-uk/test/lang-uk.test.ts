import { Container } from '@nlpjs-neo/core';
import { LangUk } from '../src/index.js';

describe('Language Ukrainian', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangUk);
      const tokenizer = instance.get('tokenizer-uk');
      expect(tokenizer.constructor.name).toEqual('TokenizerUk');
      const stemmer = instance.get('stemmer-uk');
      expect(stemmer.constructor.name).toEqual('StemmerUk');
      const stopwords = instance.get('stopwords-uk');
      expect(stopwords.constructor.name).toEqual('StopwordsUk');
      const normalizer = instance.get('normalizer-uk');
      expect(normalizer.constructor.name).toEqual('NormalizerUk');
    });
  });
});
