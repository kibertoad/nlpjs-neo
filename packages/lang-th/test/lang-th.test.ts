import { Container } from '@nlpjs-neo/core';
import { LangTh, TokenizerTh } from '../src/index.js';

describe('Language Thai', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangTh);
      const tokenizer = instance.get('tokenizer-th');
      expect(tokenizer.constructor.name).toEqual('TokenizerTh');
      const stemmer = instance.get('stemmer-th');
      expect(stemmer.constructor.name).toEqual('StemmerTh');
      const stopwords = instance.get('stopwords-th');
      expect(stopwords.constructor.name).toEqual('StopwordsTh');
      const normalizer = instance.get('normalizer-th');
      expect(normalizer.constructor.name).toEqual('NormalizerTh');
    });
  });

  describe('Tokenizer', () => {
    test('Does not emit empty tokens for whitespace gaps', () => {
      const tokenizer = new TokenizerTh(new Container(), false);

      expect(tokenizer.tokenize('สวัสดี ครับ ผมชื่อจอห์น')).toEqual([
        'สวัสดี',
        'ครับ',
        'ผม',
        'ชื่อ',
        'จอห์น',
      ]);
    });
  });
});
