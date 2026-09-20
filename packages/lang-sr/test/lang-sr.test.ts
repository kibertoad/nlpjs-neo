import { Container } from '@nlpjs-neo/core';
import { LangSr } from '../src/index.js';

describe('Language Serbian', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangSr);
      const tokenizer = instance.get('tokenizer-sr');
      expect(tokenizer.constructor.name).toEqual('TokenizerSr');
      const stemmer = instance.get('stemmer-sr');
      expect(stemmer.constructor.name).toEqual('StemmerSr');
      const stopwords = instance.get('stopwords-sr');
      expect(stopwords.constructor.name).toEqual('StopwordsSr');
      const normalizer = instance.get('normalizer-sr');
      expect(normalizer.constructor.name).toEqual('NormalizerSr');
    });
  });
});
