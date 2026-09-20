import { NlpUtil } from '../../../src/nlp/index.js';

describe('Bengali Stemmer', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      const stemmer = NlpUtil.getStemmer('bn');
      expect(stemmer).toBeDefined();
    });
  });
  describe('Stem', () => {
    test('Should tokenize and stem bengali text', () => {
      const text = 'বলেছেন খেয়েছেন';
      const stemmer = NlpUtil.getStemmer('bn');
      const actual = stemmer.tokenizeAndStem(text);
      const expected = ['বলে', 'খেযে'];
      expect(actual).toEqual(expected);
    });
  });
});
