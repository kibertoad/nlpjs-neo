import { NormalizerTr, TokenizerTr, StemmerTr } from '../src/index.js';

const normalizer = new NormalizerTr();
const tokenizer = new TokenizerTr();
const stemmer = new StemmerTr();

describe('Stemmer', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      const instance = new StemmerTr();
      expect(instance).toBeDefined();
    });
  });

  describe('Stem', () => {
    test('Should stem "Şirketiniz ne geliştiriyor?"', () => {
      const input = 'Şirketiniz ne geliştiriyor?';
      const expected = ['sirket', 'ne', 'gelistiriyor'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input));
      const actual = stemmer.stem(tokens);
      expect(actual).toEqual(expected);
    });
  });
});
