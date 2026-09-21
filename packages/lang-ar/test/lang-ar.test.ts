import { Container } from '@nlpjs-neo/core';
import { LangAr } from '../src/index.js';

describe('Language Arabic', () => {
  describe('Use plugin', () => {
    test('Should register the classes', () => {
      const instance = new Container();
      instance.use(LangAr);
      const tokenizer = instance.get('tokenizer-ar');
      expect(tokenizer.constructor.name).toEqual('TokenizerAr');
      const stemmer = instance.get('stemmer-ar');
      expect(stemmer.constructor.name).toEqual('StemmerAr');
      const stopwords = instance.get('stopwords-ar');
      expect(stopwords.constructor.name).toEqual('StopwordsAr');
      const normalizer = instance.get('normalizer-ar');
      expect(normalizer.constructor.name).toEqual('NormalizerAr');
    });
    test('Registers trigrams with the Arabic ISO-639-3 code', () => {
      const instance = new Container();
      const language = {
        addModel:
          vi.fn<(script: string, name: string, value: string) => void>(),
      };
      instance.register('Language', language);

      instance.use(LangAr);

      expect(language.addModel).toHaveBeenCalledWith(
        'Arabic',
        'arb',
        expect.any(String)
      );
    });
  });
});
