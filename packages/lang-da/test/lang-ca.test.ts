import { Container } from '@nlpjs-neo/core';
import { LangDa } from '../src/index.js';

describe('Language Danish', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangDa);
      const tokenizer = instance.get('tokenizer-da');
      expect(tokenizer.constructor.name).toEqual('TokenizerDa');
      const stemmer = instance.get('stemmer-da');
      expect(stemmer.constructor.name).toEqual('StemmerDa');
      const stopwords = instance.get('stopwords-da');
      expect(stopwords.constructor.name).toEqual('StopwordsDa');
      const normalizer = instance.get('normalizer-da');
      expect(normalizer.constructor.name).toEqual('NormalizerDa');
    });
  });
});
