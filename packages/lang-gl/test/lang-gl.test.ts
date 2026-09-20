import { Container } from '@nlpjs-neo/core';
import { LangGl } from '../src/index.js';

describe('Language Galician', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangGl);
      const tokenizer = instance.get('tokenizer-gl');
      expect(tokenizer.constructor.name).toEqual('TokenizerGl');
      const stemmer = instance.get('stemmer-gl');
      expect(stemmer.constructor.name).toEqual('StemmerGl');
      const stopwords = instance.get('stopwords-gl');
      expect(stopwords.constructor.name).toEqual('StopwordsGl');
      const normalizer = instance.get('normalizer-gl');
      expect(normalizer.constructor.name).toEqual('NormalizerGl');
    });
  });
});
