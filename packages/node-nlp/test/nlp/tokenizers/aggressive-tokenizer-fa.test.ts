import { NlpUtil } from '../../../src/nlp/index.js';

const tokenizer = NlpUtil.getTokenizer('fa');

describe('Aggressive Tokenizer Fa', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      expect(tokenizer).toBeDefined();
    });
  });
  describe('Tokenize', () => {
    test('It must tokenize simple sentence', () => {
      const expected = ['وقتی', 'شب', 'می', 'آید', 'و', 'زمین', 'تاریک', 'است'];
      const actual = tokenizer.tokenize('وقتی شب می آید و زمین تاریک است');
      expect(actual).toEqual(expected);
    });
  });
});
