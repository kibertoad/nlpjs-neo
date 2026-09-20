import { Container } from '@nlpjs-neo/core';
import { LangPl } from '../src/index.js';

describe('Language Polish', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangPl);
      const tokenizer = instance.get('tokenizer-pl');
      expect(tokenizer.constructor.name).toEqual('TokenizerPl');
      const stemmer = instance.get('stemmer-pl');
      expect(stemmer.constructor.name).toEqual('StemmerPl');
      const stopwords = instance.get('stopwords-pl');
      expect(stopwords.constructor.name).toEqual('StopwordsPl');
      const normalizer = instance.get('normalizer-pl');
      expect(normalizer.constructor.name).toEqual('NormalizerPl');
    });
  });
});
