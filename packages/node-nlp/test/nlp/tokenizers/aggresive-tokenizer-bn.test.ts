import { NlpUtil } from '../../../src/nlp/index.js';

const tokenizer = NlpUtil.getTokenizer('bn');

describe('Aggressive Tokenizer Bn', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      expect(tokenizer).toBeDefined();
    });
  });
  describe('Tokenize', () => {
    test('It must tokenize simple sentence', () => {
      const expected = ['আমি', 'ভাত', 'খাই'];
      const actual = tokenizer.tokenize('আমি ভাত খাই');
      expect(actual).toEqual(expected);
    });
    test('It must tokenize sentences with punctuation', () => {
      const expected = ['আমি', 'ভাত', 'খাই', 'তুমি', 'খাবেনা'];
      const actual = tokenizer.tokenize(`আমি ভাত খাই। তুমি খাবেনা?`);
      expect(actual).toEqual(expected);
    });
    test('It must tokenize big sentences', () => {
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
        `বাংলাদেশ দক্ষিণ এশিয়ার একটি রাষ্ট্র। দেশটির উত্তর, পূর্ব ও পশ্চিম সীমানায় ভারত ও দক্ষিণ-পূর্ব সীমানায় মায়ানমার; দক্ষিণে বঙ্গোপসাগর। `
      );
      expect(actual).toEqual(expected);
    });
  });
});
