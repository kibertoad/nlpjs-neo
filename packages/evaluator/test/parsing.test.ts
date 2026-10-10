import { Evaluator, JavascriptCompiler } from '../src/index.js';
import type { EvaluationContext } from '../src/index.js';

const container = {
  get() {
    return undefined;
  },
};

/**
 * `Evaluator` and `JavascriptCompiler` both sit on a parser and a code
 * generator, and both walk the same ESTree subset. These tests pin the
 * boundary between the two libraries and the walkers: what the parser has to
 * produce, and what the generator has to round-trip back into source that
 * `Function` can compile.
 */
describe('Parsing and code generation', () => {
  const evaluate = {
    evaluator: (source: string, context: EvaluationContext = {}) =>
      new Evaluator().evaluate(source, context),
    compiler: (source: string, context: EvaluationContext = {}) =>
      new JavascriptCompiler(container).evaluate(source, context),
  };

  describe.each(['evaluator', 'compiler'] as const)('%s', (kind) => {
    const run = evaluate[kind];

    describe('literals', () => {
      test('It should parse a string literal', async () => {
        expect(await run("'hello'")).toEqual('hello');
      });
      test('It should parse a double quoted string literal', async () => {
        expect(await run('"hello"')).toEqual('hello');
      });
      test('It should parse a decimal literal', async () => {
        expect(await run('3.5')).toEqual(3.5);
      });
      test('It should parse a hexadecimal literal', async () => {
        expect(await run('0xff')).toEqual(255);
      });
      test('It should parse a boolean literal', async () => {
        expect(await run('true')).toEqual(true);
      });
      test('It should parse a null literal', async () => {
        expect(await run('null')).toEqual(null);
      });
      test('It should parse a regular expression literal', async () => {
        expect(await run('/ab+c/i.test("xABBc")')).toEqual(true);
      });
    });

    describe('grouping and precedence', () => {
      test('It should respect operator precedence', async () => {
        expect(await run('1 + 2 * 3')).toEqual(7);
      });
      test('It should respect parentheses', async () => {
        expect(await run('(1 + 2) * 3')).toEqual(9);
      });
      test('It should parse a chain of member accesses', async () => {
        expect(await run('a.b.c', { a: { b: { c: 42 } } })).toEqual(42);
      });
      test('It should parse a computed member access', async () => {
        expect(await run('a["b"]', { a: { b: 42 } })).toEqual(42);
      });
    });

    describe('several statements', () => {
      test('It should return the value of the last statement', async () => {
        expect(await run('1 + 1; 2 + 2')).toEqual(4);
      });
      test('It should evaluate the statements in order', async () => {
        const context: EvaluationContext = { a: 0 };
        expect(await run('a = 1; a + 2', context)).toEqual(3);
      });
      test('It should tolerate a trailing semicolon', async () => {
        expect(await run('1 + 1;')).toEqual(2);
      });
      test('It should return undefined for an empty source', async () => {
        expect(await run('')).toBeUndefined();
      });
    });

    describe('code generation for a function expression', () => {
      // A `FunctionExpression` is the one node the walkers do not interpret:
      // they hand it back to the code generator and compile the generated
      // source with `Function`, so both libraries are exercised at once.
      test('It should return a callable function', async () => {
        const result = await run('(function (a) { return a * 2; })');
        expect(typeof result).toEqual('function');
        expect(result(4)).toEqual(8);
      });

      test('It should close over the values of the context', async () => {
        const result = await run('(function (a) { return a * factor; })', {
          factor: 3,
        });
        expect(result(4)).toEqual(12);
      });

      test('It should generate a function that uses an operator chain', async () => {
        const result = await run('(function (a, b) { return (a + b) * 2; })');
        expect(result(1, 2)).toEqual(6);
      });

      test('It should keep the function as it was written', async () => {
        const result = await run(
          "(function (a) { /* a comment */ return a + 'x' + `${a}`; })"
        );
        expect(result(1)).toEqual('1x1');
        expect(result.toString()).toContain('/* a comment */');
      });

      test('It should take only the function out of a longer source', async () => {
        const result = await run(
          '[1, 2, 3].length + 1; (function (a) { return a; })'
        );
        expect(result(7)).toEqual(7);
      });
    });

    // Before it generates the source, `walkFunction` walks the body once with
    // every parameter bound to `null`. That pre-walk is what limits the bodies
    // a function expression may have, and neither limitation below has
    // anything to do with the parser; they are pinned here so that swapping
    // the parser cannot change them unnoticed.
    describe('limitations of the function expression pre-walk', () => {
      test('It should reject a body that reads a member of a parameter', async () => {
        // The pre-walk evaluates `o.name` with `o` bound to null.
        await expect(async () =>
          run('(function (o) { return o.name; })')
        ).rejects.toThrow(TypeError);
      });
    });

    describe('limitations of optional chaining', () => {
      // In JavaScript a `?.` short-circuits the whole chain, so `a?.b.c` is
      // undefined when `a` is. The walkers only short-circuit the link that
      // carries `?.`, so the plain `.c` still reads a member of undefined.
      test('It should not carry the short circuit into a plain link', async () => {
        await expect(async () =>
          run('a?.b.c', { a: undefined })
        ).rejects.toThrow(TypeError);
      });
    });

    // None of this parses under `esprima` 4, which understands nothing newer
    // than ES2017.
    describe('syntax newer than ES2017', () => {
      test('It should evaluate nullish coalescing over null', async () => {
        expect(await run('a ?? b', { a: null, b: 7 })).toEqual(7);
      });
      test('It should evaluate nullish coalescing over undefined', async () => {
        expect(await run('a ?? b', { a: undefined, b: 7 })).toEqual(7);
      });
      test('It should keep a falsy left term in nullish coalescing', async () => {
        expect(await run('a ?? b', { a: 0, b: 7 })).toEqual(0);
        expect(await run('a ?? b', { a: '', b: 'x' })).toEqual('');
        expect(await run('a ?? b', { a: false, b: true })).toEqual(false);
      });
      test('It should not evaluate the right term when the left one is set', async () => {
        const context = { a: 'kept', b: 'ignored' };
        expect(await run('a ?? b', context)).toEqual('kept');
      });

      test('It should short-circuit an optional member access', async () => {
        expect(await run('a?.b', { a: undefined })).toBeUndefined();
        expect(await run('a?.b', { a: null })).toBeUndefined();
      });
      test('It should read through an optional member access', async () => {
        expect(await run('a?.b', { a: { b: 42 } })).toEqual(42);
      });
      test('It should short-circuit an optional computed access', async () => {
        expect(await run('a?.["b"]', { a: undefined })).toBeUndefined();
      });
      test('It should read through an optional computed access', async () => {
        expect(await run('a?.["b"]', { a: { b: 42 } })).toEqual(42);
      });
      test('It should short-circuit a chain of optional accesses', async () => {
        expect(await run('a?.b?.c', { a: undefined })).toBeUndefined();
        expect(await run('a?.b?.c', { a: {} })).toBeUndefined();
        expect(await run('a?.b?.c', { a: { b: { c: 9 } } })).toEqual(9);
      });
      test('It should short-circuit an optional call', async () => {
        expect(await run('a?.()', { a: undefined })).toBeUndefined();
      });

      test('It should parse a numeric separator', async () => {
        expect(await run('1_000_000')).toEqual(1000000);
      });
      test('It should parse a numeric separator inside an expression', async () => {
        expect(await run('2_0 * 3')).toEqual(60);
      });
    });

    describe('invalid syntax', () => {
      test('It should throw for an unbalanced parenthesis', async () => {
        await expect(async () => run('(1 + ')).rejects.toBeDefined();
      });
      test('It should throw for an unknown operator', async () => {
        await expect(async () => run('true ^^ false')).rejects.toBeDefined();
      });
    });
  });
});
