import { TokenizerPt } from '../src/index.js';

const tokenizer = new TokenizerPt();

describe('Tokenizer', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      const instance = new TokenizerPt();
      expect(instance).toBeDefined();
    });
  });

  describe('Tokenize', () => {
    test('Should tokenize "disse-me DISSE-ME covid-19 COVID-19 covid19"', () => {
      const input = 'disse-me DISSE-ME covid-19 COVID-19 covid19';
      const expected = [
        'disse',
        'me',
        'DISSE',
        'ME',
        'covid-19',
        'COVID-19',
        'covid19',
      ];
      const actual = tokenizer.tokenize(input);
      expect(actual).toEqual(expected);
    });
  });
});
