import TokenizerFr from '../src/tokenizer-fr.js';

describe('Tokenizer French', () => {
  describe('Tokenize', () => {
    it('Should tokenize "j’ai mauvais not une"', () => {
      const tokenizer = new TokenizerFr();
      const input = 'j’ai mauvais not une';
      const expected = ['j', 'ai', 'mauvais', 'not', 'une'];
      const actual = tokenizer.tokenize(input);
      expect(actual).toEqual(expected);
    });
  });
});
