import Stopwords from '../src/stopwords.js';
import type { StopwordDictionary } from '../src/index.js';
import { containerBootstrap } from '../src/index.js';
import { defaultContainer } from '../src/container.js';
import { Container } from '../src/container.js';

class MockedStopwords extends Stopwords {
  declare dictionary: StopwordDictionary;
  declare name: string;

  constructor(container, locale, words) {
    super(container);
    this.name = `stopwords-${locale}`;
    this.dictionary = {};
    this.build(words);
  }
}

function getContainer() {
  const container = containerBootstrap();
  container.use(new MockedStopwords(container, 'en', ['remove', 'this']));
  container.use(new MockedStopwords(container, 'es', ['quitar', 'esto']));
  return container;
}

describe('Stopwords', () => {
  describe('Constructor', () => {
    test('You can create an instance', () => {
      const stopwords = new Stopwords();
      expect(stopwords).toBeDefined();
    });
    test('The name of the instance should be "removeStopwords" by default', () => {
      const stopwords = new Stopwords();
      expect(stopwords.name).toEqual('removeStopwords');
    });
    test('By default the container is defaultContainer', () => {
      const stopwords = new Stopwords();
      expect(stopwords.container).toBe(defaultContainer);
    });
    test('I can provide a container', () => {
      const container = new Container();
      const stopwords = new Stopwords(container);
      expect(stopwords.container).toBe(container);
    });
    test('I can provide a container inside a settings object', () => {
      const container = new Container();
      const stopwords = new Stopwords({ container });
      expect(stopwords.container).toBe(container);
    });
  });

  describe('Build', () => {
    test('It should build a dictionary of words', () => {
      const stopwords = new Stopwords();
      stopwords.build(['remove', 'this']);
      expect(stopwords.dictionary).toBeDefined();
      expect(stopwords.dictionary.remove).toBeTruthy();
      expect(stopwords.dictionary.this).toBeTruthy();
    });
  });

  describe('Is not stopword', () => {
    test('It should return true if the word is not stopword', () => {
      const stopwords = new Stopwords();
      stopwords.build(['remove', 'this']);
      expect(stopwords.isNotStopword('remove')).toBeFalsy();
      expect(stopwords.isNotStopword('something')).toBeTruthy();
    });
  });

  describe('Is stopword', () => {
    test('It should return true if the word is stopword', () => {
      const stopwords = new Stopwords();
      stopwords.build(['remove', 'this']);
      expect(stopwords.isStopword('something')).toBeFalsy();
      expect(stopwords.isStopword('remove')).toBeTruthy();
    });
  });

  describe('remove stopwords', () => {
    test('It should remove stopwords from an array of tokens', () => {
      const stopwords = new Stopwords();
      stopwords.build(['remove', 'this']);
      const actual = stopwords.removeStopwords([
        'this',
        'should',
        'remove',
        'remove',
        'and',
        'this',
      ]);
      const expected = ['should', 'and'];
      expect(actual).toEqual(expected);
    });
  });

  describe('Run', () => {
    test('A locale can be set', () => {
      const container = getContainer();
      const stopwords = container.get<Stopwords>('removeStopwords');
      const input = {
        settings: { keepStopwords: false },
        tokens: ['esto', 'debe', 'quitar', 'esto', 'y', 'esto'],
        locale: 'es',
      };
      const actual = stopwords.run(input);
      expect(actual.tokens).toEqual(['debe', 'y']);
    });
    test('If no locale is defined then use locale "en"', () => {
      const container = getContainer();
      const stopwords = container.get<Stopwords>('removeStopwords');
      const input = {
        settings: { keepStopwords: false },
        tokens: ['this', 'should', 'remove', 'this', 'and', 'this'],
      };
      const actual = stopwords.run(input);
      expect(actual.tokens).toEqual(['should', 'and']);
    });
  });
});
