import { NlpUtil } from '../../../src/nlp/index.js';

const tokenizer = NlpUtil.getTokenizer('sv');

describe('Aggressive Tokenizer Sv', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      expect(tokenizer).toBeDefined();
    });
  });
  describe('Tokenize', () => {
    test('It must tokenize simple sentence', () => {
      const expected = [
        'nar',
        'natten',
        'kommer',
        'och',
        'jorden',
        'ar',
        'mork',
      ];
      const actual = tokenizer.tokenize('När natten kommer och jorden är mörk');
      expect(actual).toEqual(expected);
    });
  });
});
