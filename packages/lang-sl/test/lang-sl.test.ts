import { Container } from '@nlpjs-neo/core';
import { LangSl } from '../src/index.js';

describe('Language Slovene', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangSl);
      const tokenizer = instance.get('tokenizer-sl');
      expect(tokenizer.constructor.name).toEqual('TokenizerSl');
      const stemmer = instance.get('stemmer-sl');
      expect(stemmer.constructor.name).toEqual('StemmerSl');
      const stopwords = instance.get('stopwords-sl');
      expect(stopwords.constructor.name).toEqual('StopwordsSl');
      const normalizer = instance.get('normalizer-sl');
      expect(normalizer.constructor.name).toEqual('NormalizerSl');
    });
  });
});
