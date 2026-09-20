import { NormalizerPt, TokenizerPt, StemmerPt } from '../src/index.js';

const normalizer = new NormalizerPt();
const tokenizer = new TokenizerPt();
const stemmer = new StemmerPt();

describe('Stemmer', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      const instance = new StemmerPt();
      expect(instance).toBeDefined();
    });
  });

  describe('Stem', () => {
    test('Should stem "disse-me o que sua empresa desenvolve?"', () => {
      const input = 'disse-me o que sua empresa desenvolve?';
      const expected = ['diss', 'me', 'o', 'que', 'sua', 'empres', 'desenvolv'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input));
      const actual = stemmer.stem(tokens);
      expect(actual).toEqual(expected);
    });
  });
});
