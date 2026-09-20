import { NlpUtil } from '../../../src/nlp/index.js';

const tokenizer = NlpUtil.getTokenizer('fr');

describe('Aggressive Tokenizer Fr', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      expect(tokenizer).toBeDefined();
    });
  });
  describe('Tokenize', () => {
    test('It must tokenize simple sentence', () => {
      const expected = [
        'quand',
        'la',
        'nuit',
        'vient',
        'et',
        'que',
        'la',
        'terre',
        'est',
        'sombre',
      ];
      const actual = tokenizer.tokenize(
        'Quand la nuit vient et que la terre est sombre'
      );
      expect(actual).toEqual(expected);
    });
    test('It must tokenize and normalize', () => {
      const expected = ['que', 'qui'];
      const actual = tokenizer.tokenize('Qué quì', true);
      expect(actual).toEqual(expected);
    });
  });
});
