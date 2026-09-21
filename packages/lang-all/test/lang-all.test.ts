import { Container } from '@nlpjs-neo/core';
import { bow, dict, getStemmer, LangAll } from '../src/index.js';

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
    test('Builds vocabularies with asynchronous stemmers', async () => {
      const vocabulary = await dict(['hello world'], 'ko', true);
      const vector = await bow('hello', vocabulary);

      expect(vocabulary.length).toBeGreaterThan(0);
      expect(vector.some((value) => value === 1)).toBe(true);
    });
  });
});
