import { NlpUtil } from '../../../src/nlp/index.js';

const tokenizer = NlpUtil.getTokenizer('es');

describe('Aggressive Tokenizer Es', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      expect(tokenizer).toBeDefined();
    });
  });
  describe('Tokenize', () => {
    test('It must tokenize simple sentence', () => {
      const expected = ['Esta', 'frase', 'debería', 'ser', 'tokenizada'];
      const actual = tokenizer.tokenize(
        'Esta frase debería ser tokenizada',
        false
      );
      expect(actual).toEqual(expected);
    });
    test('It must tokenize and normalize', () => {
      const expected = ['esta', 'frase', 'deberia', 'ser', 'tokenizada'];
      const actual = tokenizer.tokenize(
        'Esta frase debería ser tokenizada',
        true
      );
      expect(actual).toEqual(expected);
    });
  });
});
