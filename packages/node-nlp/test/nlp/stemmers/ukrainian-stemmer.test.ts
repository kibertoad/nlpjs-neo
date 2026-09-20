import { NlpUtil } from '../../../src/nlp/index.js';

describe('Ukrainian Stemmer', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      const stemmer = NlpUtil.getStemmer('uk');
      expect(stemmer).toBeDefined();
    });
  });
  describe('Stem', () => {
    test('Should tokenize and stem ukrainian text', () => {
      const text = 'історія hola випробування Чепинога';
      const stemmer = NlpUtil.getStemmer('uk');
      const actual = stemmer.tokenizeAndStem(text);
      const expected = ['істор', 'hola', 'випробуван', 'чепиног'];
      expect(actual).toEqual(expected);
    });
  });
});
