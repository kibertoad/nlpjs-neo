import { Container } from '@nlpjs-neo/core';
import { getStemmer, LangAll } from '../src/index.js';

describe('Language All', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangAll);
      const tokenizer = instance.get('tokenizer-en');
      expect(tokenizer.constructor.name).toEqual('TokenizerEn');
      const stemmer = instance.get('stemmer-en');
      expect(stemmer.constructor.name).toEqual('StemmerEn');
      const stopwords = instance.get('stopwords-en');
      expect(stopwords.constructor.name).toEqual('StopwordsEn');
    });
  });

  describe('Language functions', () => {
    test('Should resolve Bengali by its ISO code and language name', () => {
      expect(getStemmer('bn').constructor.name).toEqual('StemmerBn');
      expect(getStemmer('bengali').constructor.name).toEqual('StemmerBn');
    });
  });
});
