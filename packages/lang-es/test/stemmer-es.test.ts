import { NormalizerEs, TokenizerEs, StemmerEs } from '../src/index.js';

const normalizer = new NormalizerEs();
const tokenizer = new TokenizerEs();
const stemmer = new StemmerEs();

describe('Stemmer', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      const instance = new StemmerEs();
      expect(instance).toBeDefined();
    });
  });

  describe('Stem', () => {
    test('Should stem "qué desarrolla tu compañía?"', () => {
      const input = 'qué desarrolla tu compañía?';
      const expected = ['que', 'desarroll', 'tu', 'compan'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input));
      const actual = stemmer.stem(tokens);
      expect(actual).toEqual(expected);
    });
    test('Should stem "¿tu compañía tiene otros productos?"', () => {
      const input = '¿tu compañía tiene otros productos?';
      const expected = ['tu', 'compan', 'ten', 'otro', 'product'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input));
      const actual = stemmer.stem(tokens);
      expect(actual).toEqual(expected);
    });
    test('Should stem "¿qué está creando tu compañía?"', () => {
      const input = '¿qué está creando tu compañía?';
      const expected = ['que', 'esta', 'cre', 'tu', 'compan'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input));
      const actual = stemmer.stem(tokens);
      expect(actual).toEqual(expected);
    });
    test('Should stem "¿Qué está creando tu empresa?"', () => {
      const input = '¿Qué está creando tu empresa?';
      const expected = ['que', 'esta', 'cre', 'tu', 'empres'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input));
      const actual = stemmer.stem(tokens);
      expect(actual).toEqual(expected);
    });
    test('Should stem "¿Tiene tu empresa otras aplicaciones?"', () => {
      const input = '¿Tiene tu empresa otras aplicaciones?';
      const expected = ['ten', 'tu', 'empres', 'otra', 'aplicacion'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input));
      const actual = stemmer.stem(tokens);
      expect(actual).toEqual(expected);
    });
    test('Should stem "¿qué más está desarrollando tu empresa?"', () => {
      const input = '¿qué más está desarrollando tu empresa?';
      const expected = ['que', 'mas', 'esta', 'desarroll', 'tu', 'empres'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input));
      const actual = stemmer.stem(tokens);
      expect(actual).toEqual(expected);
    });
    test('Should stem "realizarnos realizar realizando realizado"', () => {
      const input = 'realizarnos realizar realizando realizado';
      const expected = ['realic', 'realic', 'realic', 'realic'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input));
      const actual = stemmer.stem(tokens);
      expect(actual).toEqual(expected);
    });
    test('Should stem "covid-19 covid19"', () => {
      const input = 'covid-19 covid19';
      const expected = ['covid-19', 'covid19'];
      const tokens = tokenizer.tokenize(normalizer.normalize(input));
      const actual = stemmer.stem(tokens);
      expect(actual).toEqual(expected);
    });
  });
  describe('What is ours on top of Snowball', () => {
    test.each([
      ['lavarme', 'lav'],
      ['sentarse', 'sent'],
      ['darte', 'dar'],
    ])('It should take the pronoun off the infinitive %s', (word, stem) => {
      expect(stemmer.stemWord(word)).toEqual(stem);
    });

    test.each([
      ['abierta', 'abrir'],
      ['abierto', 'abrir'],
    ])('It should answer %s from the dictionary', (word, stem) => {
      expect(stemmer.stemWord(word)).toEqual(stem);
    });

    test.each([
      ['comieren', 'com'],
      ['vivieres', 'viv'],
      ['cantares', 'cant'],
    ])(
      'It should take off the ending of the subjunctive in %s',
      (word, stem) => {
        expect(stemmer.stemWord(word)).toEqual(stem);
      }
    );

    test.each([
      ['luz', 'luc'],
      ['luces', 'luc'],
      ['paz', 'pac'],
    ])('It should write a final z as c in %s', (word, stem) => {
      expect(stemmer.stemWord(word)).toEqual(stem);
    });
  });

  describe('The endings of Snowball', () => {
    test.each([
      ['alabanza', 'alab'],
      ['administrativa', 'administr'],
      ['ciudades', 'ciudad'],
    ])('It should take the ending off %s', (word, stem) => {
      expect(stemmer.stemWord(word)).toEqual(stem);
    });
  });
});
