import { NlpUtil } from '../../../src/nlp/index.js';

const tokenizer = NlpUtil.getTokenizer('ru');

describe('Aggressive Tokenizer Ru', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      expect(tokenizer).toBeDefined();
    });
  });
  describe('Tokenize', () => {
    test('It must tokenize simple sentence', () => {
      const expected = ['когда', 'наступает', 'ночь', 'и', 'земля', 'темная'];
      const actual = tokenizer.tokenize('Когда наступает ночь и земля темная');
      expect(actual).toEqual(expected);
    });
  });
});
