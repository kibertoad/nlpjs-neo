/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Evaluator, JavascriptCompiler } from '../src/index.js';

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
    evaluator: (source: string, context: any = {}) =>
      new Evaluator().evaluate(source, context),
    compiler: (source: string, context: any = {}) =>
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
        const context: any = { a: 0 };
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
