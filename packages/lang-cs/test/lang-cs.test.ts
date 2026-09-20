import { Container } from '@nlpjs-neo/core';
import { LangCs } from '../src/index.js';

describe('Language Czech', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangCs);
      const tokenizer = instance.get('tokenizer-cs');
      expect(tokenizer.constructor.name).toEqual('TokenizerCs');
      const stemmer = instance.get('stemmer-cs');
      expect(stemmer.constructor.name).toEqual('StemmerCs');
      const stopwords = instance.get('stopwords-cs');
      expect(stopwords.constructor.name).toEqual('StopwordsCs');
      const normalizer = instance.get('normalizer-cs');
      expect(normalizer.constructor.name).toEqual('NormalizerCs');
    });
  });
});
