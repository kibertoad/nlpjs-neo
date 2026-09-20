import { NlpUtil } from '../../../src/nlp/index.js';

describe('Tagalog Stemmer', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      const stemmer = NlpUtil.getStemmer('tl');
      expect(stemmer).toBeDefined();
    });
  });
  describe('Stem', () => {
    test('Patuloy pa din sila sa paghahanap ng posibleng gamot sa malubhang sakit ng dinaramdam ng kanyang ina', () => {
      const text =
        'Patuloy pa din sila sa paghahanap ng posibleng gamot sa malubhang sakit ng dinaramdam ng kanyang ina';
      const stemmer = NlpUtil.getStemmer('tl');
      const actual = stemmer.tokenizeAndStem(text);
      const expected = [
        'tuloy',
        'pa',
        'din',
        'sila',
        'sa',
        'hanap',
        'ng',
        'posible',
        'gamot',
        'sa',
        'lubha',
        'sakit',
        'ng',
        'daramdam',
        'ng',
        'kanya',
        'ina',
      ];
      expect(actual).toEqual(expected);
    });
  });
});
