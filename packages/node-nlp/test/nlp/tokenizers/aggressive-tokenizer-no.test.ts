import { NlpUtil } from '../../../src/nlp/index.js';

const tokenizer = NlpUtil.getTokenizer('no');

describe('Aggressive Tokenizer No', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      expect(tokenizer).toBeDefined();
    });
  });
  describe('Tokenize', () => {
    test('It must tokenize simple sentence', () => {
      const expected = [
        'Når',
        'natten',
        'kommer',
        'og',
        'jorden',
        'er',
        'mørk',
      ];
      const actual = tokenizer.tokenize(
        'Når natten kommer og jorden er mørk',
        false
      );
      expect(actual).toEqual(expected);
    });
    test('It must tokenize and normalize', () => {
      const expected = [
        'nar',
        'natten',
        'kommer',
        'og',
        'jorden',
        'er',
        'mørk',
      ];
      const actual = tokenizer.tokenize(
        'Når natten kommer og jorden er mørk',
        true
      );
      expect(actual).toEqual(expected);
    });
  });
});
