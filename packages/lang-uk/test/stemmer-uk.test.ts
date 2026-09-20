import StemmerUk from '../src/stemmer-uk.js';

const stemmer = new StemmerUk();

describe('Stemmer Ukranian', () => {
  describe('It should stem', () => {
    test('розмовляючи', () => {
      const actual = stemmer.stemWord('розмовляючи');
      const expected = 'розмовляюч';
      expect(actual).toEqual(expected);
    });
    test('говорити', () => {
      const actual = stemmer.stemWord('говорити');
      const expected = 'говор';
      expect(actual).toEqual(expected);
    });
    test('парковка', () => {
      const actual = stemmer.stemWord('парковка');
      const expected = 'парковк';
      expect(actual).toEqual(expected);
    });
    test('експеримент', () => {
      const actual = stemmer.stemWord('експеримент');
      const expected = 'експеримент';
      expect(actual).toEqual(expected);
    });
    test('зустрічі', () => {
      const actual = stemmer.stemWord('зустрічі');
      const expected = 'зустріч';
      expect(actual).toEqual(expected);
    });
    test('потурбувавши', () => {
      const actual = stemmer.stemWord('потурбувавши');
      const expected = 'потурбува';
      expect(actual).toEqual(expected);
    });
  });
});
