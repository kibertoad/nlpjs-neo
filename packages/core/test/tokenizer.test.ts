import { Container, Normalizer, Tokenizer } from '../src/index.js';

/** A tokenizer wired to a normalizer, as the language packages register it. */
function buildTokenizer(shouldNormalize = false) {
  const container = new Container();
  container.register('normalizer-en', new Normalizer());
  const tokenizer = new Tokenizer(container, shouldNormalize);
  tokenizer.name = 'tokenize-en';
  return tokenizer;
}

describe('Tokenizer', () => {
  describe('Normalizes', () => {
    test('An explicit flag decides, whatever the setting is', () => {
      expect(buildTokenizer(false).normalizes(true)).toBeTruthy();
      expect(buildTokenizer(true).normalizes(false)).toBeFalsy();
    });
    test('Without a flag the setting decides', () => {
      expect(buildTokenizer(false).normalizes()).toBeFalsy();
      expect(buildTokenizer(true).normalizes()).toBeTruthy();
    });
    test('The input object a pipeline forwards does not normalize again', () => {
      const input = { text: 'Hôtel', locale: 'en' };
      expect(buildTokenizer(false).normalizes(input)).toBeFalsy();
      expect(buildTokenizer(true).normalizes(input)).toBeFalsy();
    });
  });

  describe('Tokenize', () => {
    test('Tokens of a pipeline input do not answer a later normalized call', () => {
      const tokenizer = buildTokenizer();
      expect(tokenizer.tokenize('Hôtel', { text: 'Hôtel' })).toEqual(['Hôtel']);
      expect(tokenizer.tokenize('Hôtel', true)).toEqual(['hotel']);
    });
    test('Normalized tokens of the setting do not answer a later raw call', () => {
      const tokenizer = buildTokenizer(true);
      expect(tokenizer.tokenize('Hôtel')).toEqual(['hotel']);
      expect(tokenizer.tokenize('Hôtel', false)).toEqual(['Hôtel']);
    });
    test('A repeated call is answered from the cache', () => {
      const tokenizer = buildTokenizer();
      const first = tokenizer.tokenize('one two', true);
      expect(tokenizer.tokenize('one two', true)).toBe(first);
    });
  });
});
