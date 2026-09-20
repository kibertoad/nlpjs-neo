import { Handlebars } from '../../src/index.js';

describe('Handlebars', () => {
  describe('compile', () => {
    it('Should return a function', () => {
      const actual = Handlebars.compile(`Hello {{ something }}`);
      expect(actual).toBeInstanceOf(Function);
    });
  });

  describe('execute', () => {
    it('Should return the same string if no variables', () => {
      const answer = Handlebars.compile('Hello')();
      expect(answer).toEqual('Hello');
    });
    it('Should replace variables from the context', () => {
      const context = {
        name: 'Jesus',
        a: 43,
      };
      const answer = Handlebars.compile('Hello {{ name }} {{ a }}')(context);
      expect(answer).toEqual('Hello Jesus 43');
    });
    it('Should be able to call functions of the context', () => {
      const context = {
        name: 'Jesus',
        a: 43,
        double: (x) => x * 2,
      };
      const answer = Handlebars.compile('Hello {{ name }} {{ double(a) }}')(
        context
      );
      expect(answer).toEqual('Hello Jesus 86');
    });
    it('Should be able to do operations with variables of the context', () => {
      const context = {
        name: 'Jesus',
        a: 43,
        b: 10,
        double: (x) => x * 2,
      };
      const answer = Handlebars.compile('Hello {{ name }} {{ double(a + b) }}')(
        context
      );
      expect(answer).toEqual('Hello Jesus 106');
    });
    it('Should be able to process arrays', () => {
      const context = {
        name: 'Jesus',
        a: 43,
        b: 10,
        double: (x) => x * 2,
      };
      const answer = Handlebars.compile([
        'Hello {{ name }}',
        'This is {{ double(a + b) }}',
      ])(context);
      expect(answer).toEqual(['Hello Jesus', 'This is 106']);
    });
    it('Should be able to process objects', () => {
      const context = {
        name: 'Jesus',
        a: 43,
        b: 10,
        double: (x) => x * 2,
      };
      const obj = {
        name: '{{ name }}',
        nested: {
          id: '{{ double(a+b) }}',
        },
      };
      const answer = Handlebars.compile(obj)(context);
      expect(answer).toEqual({ name: 'Jesus', nested: { id: '106' } });
    });
  });
});
