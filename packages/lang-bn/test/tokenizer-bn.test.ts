import { TokenizerBn, NormalizerBn } from '../src/index.js';

describe('Tokenizer Bengali', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      const tokenizer = new TokenizerBn();
      expect(tokenizer).toBeDefined();
    });
  });
  describe('Tokenize', () => {
    test('It must tokenize simple sentence', () => {
      const tokenizer = new TokenizerBn();
      const normalizer = new NormalizerBn();
      const expected = ['আমি', 'ভাত', 'খাই'];
      const actual = tokenizer.tokenize(normalizer.normalize('আমি ভাত খাই'));
      expect(actual).toEqual(expected);
    });
    test('It must tokenize sentences with punctuation', () => {
      const tokenizer = new TokenizerBn();
      const normalizer = new NormalizerBn();
      const expected = ['আমি', 'ভাত', 'খাই', 'তুমি', 'খাবেনা'];
      const actual = tokenizer.tokenize(
        normalizer.normalize(`আমি ভাত খাই। তুমি খাবেনা?`)
      );
      expect(actual).toEqual(expected);
    });
    test('It must tokenize big sentences', () => {
      const tokenizer = new TokenizerBn();
      const normalizer = new NormalizerBn();
      const expected = [
        'বাংলাদেশ',
        'দকষিণ',
        'এশিযার',
        'একটি',
        'রাষ্ট্র',
        'দেশটির',
        'উত্তর',
        'পুর্ব',
        'ও',
        'পশ্চিম',
        'সিমানায়',
        'ভারত',
        'ও',
        'দক্ষিণ',
        'পূর্ব',
        'সীমানায়',
        'মায়ানমার',
        'দক্ষিণে',
        'বঙ্গোপসাগর',
      ];
      const actual = tokenizer.tokenize(
        normalizer.normalize(
          `বাংলাদেশ দক্ষিণ এশিয়ার একটি রাষ্ট্র। দেশটির উত্তর, পূর্ব ও পশ্চিম সীমানায় ভারত ও দক্ষিণ-পূর্ব সীমানায় মায়ানমার; দক্ষিণে বঙ্গোপসাগর। `
        )
      );
      expect(actual).toEqual(expected);
    });
  });
});
