import { Container } from '@nlpjs-neo/core';
import { LangKo } from '../src/index.js';

describe('Language Korean', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangKo);
      const tokenizer = instance.get('tokenizer-ko');
      expect(tokenizer.constructor.name).toEqual('TokenizerKo');
      const stemmer = instance.get('stemmer-ko');
      expect(stemmer.constructor.name).toEqual('StemmerKo');
      const stopwords = instance.get('stopwords-ko');
      expect(stopwords.constructor.name).toEqual('StopwordsKo');
      const normalizer = instance.get('normalizer-ko');
      expect(normalizer.constructor.name).toEqual('NormalizerKo');
    });
  });
});
