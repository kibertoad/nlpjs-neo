import { NlpUtil } from '../../../src/nlp/index.js';

const tokenizer = NlpUtil.getTokenizer('it');

describe('Aggressive Tokenizer It', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      expect(tokenizer).toBeDefined();
    });
  });
  describe('Tokenize', () => {
    test('It must tokenize simple sentence', () => {
      const expected = [
        'Quando',
        'arriva',
        'la',
        'notte',
        'e',
        'la',
        'terra',
        'è',
        'oscura',
      ];
      const actual = tokenizer.tokenize(
        'Quando arriva la notte e la terra è oscura',
        false
      );
      expect(actual).toEqual(expected);
    });
    test('It must tokenize and normalize', () => {
      const expected = [
        'quando',
        'arriva',
        'la',
        'notte',
        'e',
        'la',
        'terra',
        'e',
        'oscura',
      ];
      const actual = tokenizer.tokenize(
        'Quando arriva la notte e la terra è oscura',
        true
      );
      expect(actual).toEqual(expected);
    });
  });
});
