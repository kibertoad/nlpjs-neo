import { Container } from '@nlpjs-neo/core';
import { LangFr } from '../src/index.js';

describe('Language French', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangFr);
      const tokenizer = instance.get('tokenizer-fr');
      expect(tokenizer.constructor.name).toEqual('TokenizerFr');
      const stemmer = instance.get('stemmer-fr');
      expect(stemmer.constructor.name).toEqual('StemmerFr');
      const stopwords = instance.get('stopwords-fr');
      expect(stopwords.constructor.name).toEqual('StopwordsFr');
      const normalizer = instance.get('normalizer-fr');
      expect(normalizer.constructor.name).toEqual('NormalizerFr');
    });
  });
});
