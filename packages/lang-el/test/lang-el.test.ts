import { Container } from '@nlpjs-neo/core';
import { SentimentManager } from '../../node-nlp/src/index.js';
import { LangEl } from '../src/index.js';

describe('Language Greek', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangEl);
      const tokenizer = instance.get('tokenizer-el');
      expect(tokenizer.constructor.name).toEqual('TokenizerEl');
      const stemmer = instance.get('stemmer-el');
      expect(stemmer.constructor.name).toEqual('StemmerEl');
      const stopwords = instance.get('stopwords-el');
      expect(stopwords.constructor.name).toEqual('StopwordsEl');
      const normalizer = instance.get('normalizer-el');
      expect(normalizer.constructor.name).toEqual('NormalizerEl');
    });
  });

  describe('Sentiment evaluation', () => {
    test('Accentuation matching between sentiment input and afinn data', async () => {
      const sentiment = new SentimentManager();
      const result = await sentiment.process(
        'el',
        'Γεια σου, τι κάνεις? Εγώ είμαι πολυ περιωρισμένος'
      );
      expect(result.score).toEqual(-1);
    });
  });
});
