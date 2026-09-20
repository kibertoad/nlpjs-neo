import { compile } from '../src/index.js';

describe('Compile', () => {
  describe('compile', () => {
    it('Should return a function', () => {
      const actual = compile(`Hello {{ something }}`);
      expect(actual).toBeInstanceOf(Function);
    });
  });

  describe('execute', () => {
    it('Should return the same string if no variables', () => {
      const answer = compile('Hello')();
      expect(answer).toEqual('Hello');
    });
    it('Should return input if is not string, array or object', () => {
      const answer = compile(7)();
      expect(answer).toEqual(7);
    });
    it('Should replace variables from the context', () => {
      const context = {
        name: 'Jesus',
        a: 43,
      };
      const answer = compile('Hello {{ name }} {{ a }}')(context);
      expect(answer).toEqual('Hello Jesus 43');
    });
    it('Should store strings in dictionary when compiled', () => {
      const context = {
        name: 'Jesus',
        a: 43,
      };
      const answer = compile('Hello {{ name }} {{ a }}')(context);
      expect(answer).toEqual('Hello Jesus 43');
      const answer2 = compile('Hello {{ name }} {{ a }}')(context);
      expect(answer2).toEqual('Hello Jesus 43');
    });
    it('Should be able to call functions of the context', () => {
      const context = {
        name: 'Jesus',
        a: 43,
        double: (x) => x * 2,
      };
      const answer = compile('Hello {{ name }} {{ double(a) }}')(context);
      expect(answer).toEqual('Hello Jesus 86');
    });
    it('Should be able to do operations with variables of the context', () => {
      const context = {
        name: 'Jesus',
        a: 43,
        b: 10,
        double: (x) => x * 2,
      };
      const answer = compile('Hello {{ name }} {{ double(a + b) }}')(context);
      expect(answer).toEqual('Hello Jesus 106');
    });
    it('Should be able to process arrays', () => {
      const context = {
        name: 'Jesus',
        a: 43,
        b: 10,
        double: (x) => x * 2,
      };
      const answer = compile([
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
      const answer = compile(obj)(context);
      expect(answer).toEqual({ name: 'Jesus', nested: { id: '106' } });
    });
  });
});
