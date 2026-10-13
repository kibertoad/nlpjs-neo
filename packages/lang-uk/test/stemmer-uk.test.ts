import StemmerUk from '../src/stemmer-uk.js';

const stemmer = new StemmerUk();

test('Stems the Cyrillic -ость suffix', () => {
  const actual = stemmer.stemWord('\u0440\u0430\u0434\u043e\u0441\u0442\u044c');
  expect(actual).toEqual('\u0440\u0430\u0434');
});

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
