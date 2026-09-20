import { NlpUtil } from '../../../src/nlp/index.js';

const tokenizer = NlpUtil.getTokenizer('id');

describe('Aggressive Tokenizer Id', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      expect(tokenizer).toBeDefined();
    });
  });
  describe('Tokenize', () => {
    test('It must tokenize simple sentence', () => {
      const expected = ['ketika', 'malam', 'datang', 'dan', 'bumi', 'gelap'];
      const actual = tokenizer.tokenize('Ketika malam datang dan bumi gelap');
      expect(actual).toEqual(expected);
    });
  });
});
