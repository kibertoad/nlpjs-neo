import Normalizer from '../src/normalizer.js';
import { defaultContainer } from '../src/container.js';
import { Container } from '../src/container.js';

class MockNormalizer {
  /** The character this normalizer strips. */
  declare char: string;
  declare container: Container;
  declare locale: string;
  declare name: string;
  declare regex: RegExp;

  constructor(container: Container, locale: string, char: string) {
    this.container = container;
    this.locale = locale;
    this.char = char;
    this.name = `normalizer-${this.locale}`;
    this.regex = new RegExp(char, 'g');
  }

  normalize(text) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(this.regex, '*');
  }
}

function getContainer() {
  const container = new Container();
  container.use(new MockNormalizer(container, 'en', 'e'));
  container.use(new MockNormalizer(container, 'es', 'a'));
  return container;
}

describe('Normalizer', () => {
  describe('Constructor', () => {
    test('You can create an instance', () => {
      const normalizer = new Normalizer();
      expect(normalizer).toBeDefined();
    });
    test('The name of the instance should be "normalize" by default', () => {
      const normalizer = new Normalizer();
      expect(normalizer.name).toEqual('normalize');
    });
    test('By default the container is defaultContainer', () => {
      const normalizer = new Normalizer();
      expect(normalizer.container).toBe(defaultContainer);
    });
    test('I can provide a container', () => {
      const container = {} as Container;
      const normalizer = new Normalizer(container);
      expect(normalizer.container).toBe(container);
    });
    test('I can provide a container inside a settings object', () => {
      const container = {} as Container;
      const normalizer = new Normalizer({ container });
      expect(normalizer.container).toBe(container);
    });
  });

  describe('Normalize', () => {
    test('It can normalize a text', () => {
      const input = 'Ñam aquí, Lérn';
      const expected = 'nam aqui, lern';
      const normalizer = new Normalizer();
      const actual = normalizer.normalize(input);
      expect(actual).toEqual(expected);
    });
  });

  describe('Run', () => {
    test('It can normalize a text', () => {
      const input = { text: 'Ñam aquí, Lérn' };
      const expected = 'nam aqui, lern';
      const normalizer = new Normalizer();
      const actual = normalizer.run(input);
      expect(actual.text).toEqual(expected);
    });

    test('If a normalizer for the input locale exists at the container, then use it', () => {
      const container = getContainer();
      const input = { text: 'Ñam aquí, Lérn', locale: 'es' };
      const expected = 'n*m *qui, lern';
      const normalizer = new Normalizer(container);
      const actual = normalizer.run(input);
      expect(actual.text).toEqual(expected);
    });

    test('If the locale is not set, then default is "en", and if the container haves a normalizer-en use it', () => {
      const container = getContainer();
      const input = { text: 'Ñam aquí, Lérn' };
      const expected = 'nam aqui, l*rn';
      const normalizer = new Normalizer(container);
      const actual = normalizer.run(input);
      expect(actual.text).toEqual(expected);
    });
  });
});
