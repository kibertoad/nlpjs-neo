import { NlpUtil } from '../../../src/nlp/index.js';

const tokenizer = NlpUtil.getTokenizer('en');

describe('Aggressive Tokenizer En', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      expect(tokenizer).toBeDefined();
    });
  });
  describe('Tokenize', () => {
    test('It must tokenize simple sentence', () => {
      const expected = ['this', 'sentence', 'should', 'be', 'tokenized'];
      const actual = tokenizer.tokenize('This sentence should be tokenized');
      expect(actual).toEqual(expected);
    });
    test('It must replace contractions', () => {
      const expected = ['i', 'am', 'you', 'are', 'is', 'not'];
      const actual = tokenizer.tokenize(`I'm you're isn't`);
      expect(actual).toEqual(expected);
    });
    test('It must replace slang contractions', () => {
      const expected = ['i', 'am', 'can', 'not', 'going', 'to', 'want', 'to'];
      const actual = tokenizer.tokenize(`I'm cannot gonna wanna`);
      expect(actual).toEqual(expected);
    });
  });
});
