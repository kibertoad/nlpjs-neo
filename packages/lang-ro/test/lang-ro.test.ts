import { Container } from '@nlpjs-neo/core';
import { LangRo } from '../src/index.js';

describe('Language Romanian', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangRo);
      const tokenizer = instance.get('tokenizer-ro');
      expect(tokenizer.constructor.name).toEqual('TokenizerRo');
      const stemmer = instance.get('stemmer-ro');
      expect(stemmer.constructor.name).toEqual('StemmerRo');
      const stopwords = instance.get('stopwords-ro');
      expect(stopwords.constructor.name).toEqual('StopwordsRo');
      const normalizer = instance.get('normalizer-ro');
      expect(normalizer.constructor.name).toEqual('NormalizerRo');
    });
  });
});
