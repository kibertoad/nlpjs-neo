import { Container } from '@nlpjs-neo/core';
import { LangZh } from '../src/index.js';

describe('Language Chinese', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangZh);
      const tokenizer = instance.get('tokenizer-zh');
      expect(tokenizer.constructor.name).toEqual('TokenizerZh');
      const stemmer = instance.get('stemmer-zh');
      expect(stemmer.constructor.name).toEqual('StemmerZh');
      const stopwords = instance.get('stopwords-zh');
      expect(stopwords.constructor.name).toEqual('StopwordsZh');
      const normalizer = instance.get('normalizer-zh');
      expect(normalizer.constructor.name).toEqual('NormalizerZh');
    });
  });
});
