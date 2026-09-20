import { Container } from '@nlpjs-neo/core';
import { LangJa } from '../src/index.js';

describe('Language Japanese', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangJa);
      const tokenizer = instance.get('tokenizer-ja');
      expect(tokenizer.constructor.name).toEqual('TokenizerJa');
      const stemmer = instance.get('stemmer-ja');
      expect(stemmer.constructor.name).toEqual('StemmerJa');
      const stopwords = instance.get('stopwords-ja');
      expect(stopwords.constructor.name).toEqual('StopwordsJa');
      const normalizer = instance.get('normalizer-ja');
      expect(normalizer.constructor.name).toEqual('NormalizerJa');
    });
  });
});
