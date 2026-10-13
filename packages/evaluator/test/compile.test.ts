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
  describe('objects and arrays inside a string', () => {
    it('Should print an object as JSON, not as [object Object]', () => {
      const answer = compile('a {{ o }} b')({ o: { x: 1 } });
      expect(answer).toEqual(`a ${JSON.stringify({ x: 1 }, null, 2)} b`);
    });
    it('Should print the items of an array of objects as JSON', () => {
      const answer = compile('a {{ list }} b')({ list: [{ x: 1 }, { x: 2 }] });
      expect(answer).toEqual(
        `a ${JSON.stringify({ x: 1 }, null, 2)},${JSON.stringify({ x: 2 }, null, 2)} b`
      );
    });
    it('Should still print an array of values as its items', () => {
      expect(compile('a {{ list }} b')({ list: [1, 2] })).toEqual('a 1,2 b');
    });
    it('Should print nothing for an empty item of an array', () => {
      expect(compile('{{ list }}')({ list: [1, null, undefined, 2] })).toEqual(
        '1,,,2'
      );
    });
    it('Should print an object without a prototype as JSON', () => {
      const bare = Object.create(null) as Record<string, unknown>;
      bare.x = 1;
      expect(compile('a {{ o }} b')({ o: bare })).toEqual(
        `a ${JSON.stringify({ x: 1 }, null, 2)} b`
      );
    });
    it('Should print a value that has a toString of its own through it', () => {
      const date = new Date(Date.UTC(2020, 0, 1));
      expect(compile('a {{ d }} b')({ d: date })).toEqual(`a ${date} b`);
    });
    it('Should print a nested array as its items, as String does', () => {
      expect(compile('{{ list }}')({ list: [[1, 2], 3] })).toEqual('1,2,3');
    });
    it('Should print an array that holds itself without recursing forever', () => {
      const circular: unknown[] = [1];
      circular.push(circular);
      expect(compile('{{ list }}')({ list: circular })).toEqual(
        String(circular)
      );
    });
    it('Should print circular data without throwing', () => {
      const circular: Record<string, unknown> = { x: 1 };
      circular.self = circular;
      expect(compile('a {{ o }} b')({ o: circular })).toEqual(
        'a [object Object] b'
      );
    });
    it('Should keep the placeholder of an expression without a value', () => {
      const answer = compile('a {{ missing }} b')({ missing: null });
      expect(answer).toEqual('a {{ missing }} b');
    });
  });

  describe('sections', () => {
    it('Should repeat a section for each item of an array', () => {
      const answer = compile('{{#items}}{{ name }},{{/#}}')({
        items: [{ name: 'a' }, { name: 'b' }],
      });
      expect(answer).toEqual('a,b,');
    });
    it('Should give the section the current item, its index and the parent', () => {
      const answer = compile(
        '{{#items}}{{ _index_ }}:{{ _current_.name }}@{{ _parent_.tag }} {{/#}}'
      )({
        items: [{ name: 'a' }, { name: 'b' }],
        tag: 't',
      });
      expect(answer).toEqual('0:a@t 1:b@t ');
    });
    it('Should repeat a section for each item of an expression', () => {
      const answer = compile('{{#data.items}}{{ name }},{{/#}}')({
        data: { items: [{ name: 'a' }, { name: 'b' }] },
      });
      expect(answer).toEqual('a,b,');
    });
    it('Should treat a value that is not an array as a single item', () => {
      const answer = compile('{{#one}}{{ name }}{{/#}}')({
        one: { name: 'a' },
      });
      expect(answer).toEqual('a');
    });
    it('Should print the content of a section of a value that is true', () => {
      expect(compile('a{{#flag}}x{{/#}}b')({ flag: true })).toEqual('axb');
    });
    it('Should nest sections', () => {
      const answer = compile('{{#rows}}[{{#cells}}{{ v }}{{/#}}]{{/#}}')({
        rows: [{ cells: [{ v: 1 }, { v: 2 }] }, { cells: [{ v: 3 }] }],
      });
      expect(answer).toEqual('[12][3]');
    });
    it('Should ignore a close that has no section to close', () => {
      expect(compile('a{{/#}}b')({})).toEqual('ab');
    });
    it('Should give an empty string for a section of an empty array', () => {
      expect(compile('a{{#items}}x{{/#}}b')({ items: [] })).toEqual('ab');
    });
    it('Should print nothing for a section the context has no value for', () => {
      expect(compile('a{{#items}}[{{ name }}]{{/#}}b')({})).toEqual('ab');
    });
    it('Should print nothing for a section of a falsy value', () => {
      expect(compile('a{{#value}}x{{/#}}b')({ value: null })).toEqual('ab');
      expect(compile('a{{#value}}x{{/#}}b')({ value: false })).toEqual('ab');
      expect(compile('a{{#value}}x{{/#}}b')({ value: 0 })).toEqual('ab');
      expect(compile('a{{#value}}x{{/#}}b')({ value: '' })).toEqual('ab');
    });
    it('Should keep rendering a template the cache has already moved past', () => {
      const template = 'first {{ n }}';
      expect(compile(template)({ n: 1 })).toEqual('first 1');
      for (let i = 0; i < 1200; i += 1) {
        compile(`filler ${i} {{ n }}`)({ n: i });
      }
      expect(compile(template)({ n: 2 })).toEqual('first 2');
    });
  });

  describe('_iterator_', () => {
    it('Should repeat an array item for each item of the context array', () => {
      const answer = compile([
        { _iterator_: '#items', label: '{{ name }}' },
        'end',
      ])({
        items: [{ name: 'a' }, { name: 'b' }],
      });
      expect(answer).toEqual([{ label: 'a' }, { label: 'b' }, 'end']);
    });
    it('Should repeat an array item for each item of an expression', () => {
      const answer = compile([
        { _iterator_: '#data.items', label: '{{ name }}' },
      ])({ data: { items: [{ name: 'a' }, { name: 'b' }] } });
      expect(answer).toEqual([{ label: 'a' }, { label: 'b' }]);
    });
    it('Should give the item the current value, its index and the parent', () => {
      const answer = compile([
        {
          _iterator_: '#items',
          label: '{{ _index_ }}:{{ _current_ }}@{{ _parent_.tag }}',
        },
      ])({ items: ['a', 'b'], tag: 't' });
      expect(answer).toEqual([{ label: '0:a@t' }, { label: '1:b@t' }]);
    });
    it('Should treat a value that is not an array as a single item', () => {
      const answer = compile([{ _iterator_: '#one', label: '{{ name }}' }])({
        one: { name: 'a' },
      });
      expect(answer).toEqual([{ label: 'a' }]);
    });
    it('Should give nothing when the context has no such array', () => {
      const answer = compile([{ _iterator_: '#items', label: 'x' }])({});
      expect(answer).toEqual([]);
    });
    it('Should give nothing when the value of the iterator is falsy', () => {
      const answer = compile([{ _iterator_: '#items', label: 'x' }])({
        items: null,
      });
      expect(answer).toEqual([]);
    });
  });

  describe('native', () => {
    it('Should keep the type of a string that is one expression', () => {
      const context = { n: 5, o: { x: 1 } };
      expect(compile('{{ n }}', { native: true })(context)).toBe(5);
      expect(compile('{{ o }}', { native: true })(context)).toBe(context.o);
    });
    it('Should keep a string as text when native is not asked for', () => {
      expect(compile('{{ n }}')({ n: 5 })).toBe('5');
    });
    it('Should still answer text when the string holds more than the expression', () => {
      expect(compile('n: {{ n }}', { native: true })({ n: 5 })).toBe('n: 5');
    });
    it('Should keep native values inside objects and arrays', () => {
      const answer = compile({ list: ['{{ n }}'] }, { native: true })({ n: 5 });
      expect(answer).toEqual({ list: [5] });
    });
    it('Should keep the placeholder of an expression without a value', () => {
      expect(compile('{{ missing }}', { native: true })({})).toBe(
        '{{ missing }}'
      );
    });
    it('Should not answer a string when it answers the value itself', () => {
      // @ts-expect-error - a native result is not typed as the template it was given
      const text: string = compile('{{ n }}', { native: true })({ n: 5 });
      expect(text).toBeTypeOf('number');
      // A template compiled without the option keeps the type it was given.
      const kept: string = compile('{{ n }}')({ n: 5 });
      expect(kept).toBeTypeOf('string');
    });
  });
});
