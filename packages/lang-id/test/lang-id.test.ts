import { Container } from '@nlpjs-neo/core';
import { LangId } from '../src/index.js';

describe('Language Indonesian', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangId);
      const tokenizer = instance.get('tokenizer-id');
      expect(tokenizer.constructor.name).toEqual('TokenizerId');
      const stemmer = instance.get('stemmer-id');
      expect(stemmer.constructor.name).toEqual('StemmerId');
      const stopwords = instance.get('stopwords-id');
      expect(stopwords.constructor.name).toEqual('StopwordsId');
      const normalizer = instance.get('normalizer-id');
      expect(normalizer.constructor.name).toEqual('NormalizerId');
    });
  });
});
