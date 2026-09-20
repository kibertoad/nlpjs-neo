import { NlpUtil } from '../../../src/nlp/index.js';

const tokenizer = NlpUtil.getTokenizer('pt');

describe('Aggressive Tokenizer Pt', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      expect(tokenizer).toBeDefined();
    });
  });
  describe('Tokenize', () => {
    test('It must tokenize simple sentence', () => {
      const expected = [
        'Quando',
        'a',
        'noite',
        'chega',
        'e',
        'a',
        'terra',
        'está',
        'escura',
      ];
      const actual = tokenizer.tokenize(
        'Quando a noite chega e a terra está escura',
        false
      );
      expect(actual).toEqual(expected);
    });
    test('It must tokenize and normalize', () => {
      const expected = [
        'quando',
        'a',
        'noite',
        'chega',
        'e',
        'a',
        'terra',
        'esta',
        'escura',
      ];
      const actual = tokenizer.tokenize(
        'Quando a noite chega e a terra está escura',
        true
      );
      expect(actual).toEqual(expected);
    });
    test('It must tokenize at hiphen', () => {
      const expected = ['disse', 'me'];
      const actual = tokenizer.tokenize('Disse-me', true);
      expect(actual).toEqual(expected);
    });
  });
});
