import { Container } from '@nlpjs-neo/core';
import { LangSv } from '../src/index.js';

describe('Language Swedish', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangSv);
      const tokenizer = instance.get('tokenizer-sv');
      expect(tokenizer.constructor.name).toEqual('TokenizerSv');
      const stemmer = instance.get('stemmer-sv');
      expect(stemmer.constructor.name).toEqual('StemmerSv');
      const stopwords = instance.get('stopwords-sv');
      expect(stopwords.constructor.name).toEqual('StopwordsSv');
      const normalizer = instance.get('normalizer-sv');
      expect(normalizer.constructor.name).toEqual('NormalizerSv');
    });
  });
});
