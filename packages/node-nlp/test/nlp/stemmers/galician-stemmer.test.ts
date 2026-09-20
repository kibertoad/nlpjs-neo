import { NlpUtil } from '../../../src/nlp/index.js';

describe('Galician Stemmer', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      const stemmer = NlpUtil.getStemmer('gl');
      expect(stemmer).toBeDefined();
    });
  });
  describe('Stem', () => {
    test('Should tokenize and stem galician text', () => {
      const text = 'Boas noites a todos os nosos espectadores';
      const stemmer = NlpUtil.getStemmer('gl');
      const actual = stemmer.tokenizeAndStem(text);
      const expected = ['boa', 'noite', 'a', 'tod', 'os', 'nos', 'especta'];
      expect(actual).toEqual(expected);
    });
  });
});
