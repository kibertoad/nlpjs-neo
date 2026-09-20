import { Container } from '@nlpjs-neo/core';
import { LangPt } from '../src/index.js';

describe('Language Portuguese', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangPt);
      const tokenizer = instance.get('tokenizer-pt');
      expect(tokenizer.constructor.name).toEqual('TokenizerPt');
      const stemmer = instance.get('stemmer-pt');
      expect(stemmer.constructor.name).toEqual('StemmerPt');
      const stopwords = instance.get('stopwords-pt');
      expect(stopwords.constructor.name).toEqual('StopwordsPt');
      const normalizer = instance.get('normalizer-pt');
      expect(normalizer.constructor.name).toEqual('NormalizerPt');
    });
  });
});
