import { NlpUtil } from '../../../src/nlp/index.js';

const tokenizer = NlpUtil.getTokenizer('pl');

describe('Aggressive Tokenizer Pl', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      expect(tokenizer).toBeDefined();
    });
  });
  describe('Tokenize', () => {
    test('It must tokenize simple sentence', () => {
      const expected = [
        'kiedy',
        'nadchodzi',
        'noc',
        'i',
        'ziemia',
        'jest',
        'ciemna',
      ];
      const actual = tokenizer.tokenize(
        'Kiedy nadchodzi noc i ziemia jest ciemna'
      );
      expect(actual).toEqual(expected);
    });
    test('It must tokenize and normalize', () => {
      const expected = ['moge', 'prosic', 'pania', 'do', 'tanca'];
      const actual = tokenizer.tokenize('Mogę prosić Panią do tańca?', true);
      expect(actual).toEqual(expected);
    });
  });
});
