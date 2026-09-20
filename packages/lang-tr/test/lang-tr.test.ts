import { Container } from '@nlpjs-neo/core';
import { LangTr } from '../src/index.js';

describe('Language Turkish', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangTr);
      const tokenizer = instance.get('tokenizer-tr');
      expect(tokenizer.constructor.name).toEqual('TokenizerTr');
      const stemmer = instance.get('stemmer-tr');
      expect(stemmer.constructor.name).toEqual('StemmerTr');
      const stopwords = instance.get('stopwords-tr');
      expect(stopwords.constructor.name).toEqual('StopwordsTr');
      const normalizer = instance.get('normalizer-tr');
      expect(normalizer.constructor.name).toEqual('NormalizerTr');
    });
  });
});
