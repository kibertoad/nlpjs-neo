import { Container } from '@nlpjs-neo/core';
import { LangFi } from '../src/index.js';

describe('Language Finnish', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangFi);
      const tokenizer = instance.get('tokenizer-fi');
      expect(tokenizer.constructor.name).toEqual('TokenizerFi');
      const stemmer = instance.get('stemmer-fi');
      expect(stemmer.constructor.name).toEqual('StemmerFi');
      const stopwords = instance.get('stopwords-fi');
      expect(stopwords.constructor.name).toEqual('StopwordsFi');
      const normalizer = instance.get('normalizer-fi');
      expect(normalizer.constructor.name).toEqual('NormalizerFi');
    });
  });
});
