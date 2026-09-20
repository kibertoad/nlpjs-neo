import { NlpUtil } from '../../../src/nlp/index.js';

describe('Spanish Stemmer', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      const stemmer = NlpUtil.getStemmer('es');
      expect(stemmer).toBeDefined();
    });
  });
  describe('Stem', () => {
    test('Should tokenize and stem spanish text', () => {
      const text =
        'Amigos, nos aburrimos. Compraría gato trepador perfectamente si lo considerara aconsejable y reiremos';
      const stemmer = NlpUtil.getStemmer('es');
      const actual = stemmer.tokenizeAndStem(text);
      const expected = [
        'amig',
        'nos',
        'aburr',
        'compr',
        'gat',
        'trep',
        'perfect',
        'si',
        'el',
        'consider',
        'aconsej',
        'y',
        'reir',
      ];
      expect(actual).toEqual(expected);
    });
  });
});
