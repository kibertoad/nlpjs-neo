import { Container } from '@nlpjs-neo/core';
import { LangDe } from '../src/index.js';

describe('Language German', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangDe);
      const tokenizer = instance.get('tokenizer-de');
      expect(tokenizer.constructor.name).toEqual('TokenizerDe');
      const stemmer = instance.get('stemmer-de');
      expect(stemmer.constructor.name).toEqual('StemmerDe');
      const stopwords = instance.get('stopwords-de');
      expect(stopwords.constructor.name).toEqual('StopwordsDe');
      const normalizer = instance.get('normalizer-de');
      expect(normalizer.constructor.name).toEqual('NormalizerDe');
    });
  });
});
