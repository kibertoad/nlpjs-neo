import { NlpUtil } from '../../../src/nlp/index.js';

const tokenizer = NlpUtil.getTokenizer('nl');

describe('Aggressive Tokenizer Nl', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      expect(tokenizer).toBeDefined();
    });
  });
  describe('Tokenize', () => {
    test('It must tokenize simple sentence', () => {
      const expected = [
        'wanneer',
        'de',
        'nacht',
        'komt',
        'en',
        'de',
        'aarde',
        'donker',
        'is',
      ];
      const actual = tokenizer.tokenize(
        'wanneer de nacht komt en de aarde donker is'
      );
      expect(actual).toEqual(expected);
    });
    test('It must tokenize and normalize', () => {
      const expected = ['meh', 'meh'];
      const actual = tokenizer.tokenize('Mèh méh', true);
      expect(actual).toEqual(expected);
    });
  });
});
