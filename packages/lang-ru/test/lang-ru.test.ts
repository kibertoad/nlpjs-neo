import { Container } from '@nlpjs-neo/core';
import { LangRu } from '../src/index.js';

describe('Language Russian', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangRu);
      const tokenizer = instance.get('tokenizer-ru');
      expect(tokenizer.constructor.name).toEqual('TokenizerRu');
      const stemmer = instance.get('stemmer-ru');
      expect(stemmer.constructor.name).toEqual('StemmerRu');
      const stopwords = instance.get('stopwords-ru');
      expect(stopwords.constructor.name).toEqual('StopwordsRu');
      const normalizer = instance.get('normalizer-ru');
      expect(normalizer.constructor.name).toEqual('NormalizerRu');
    });
  });
});
