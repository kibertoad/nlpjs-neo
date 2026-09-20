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

import { containerBootstrap } from '@nlpjs-neo/core';

// `findBuiltinEntities` wraps the whole extraction in a `try`, answers with no
// edges and logs when anything inside it throws. No input reaches that branch
// -- `compromise` returns an empty document for whatever it is handed -- so the
// failure is injected here, in a file of its own, to leave the integration
// suite driving the real library.
vi.mock('compromise', () => {
  const nlp: any = () => {
    throw new Error('compromise blew up');
  };
  nlp.extend = () => nlp;
  return { default: nlp };
});

const { BuiltinCompromise } = await import('../src/index.js');

describe('Compromise failures', () => {
  test('It should answer with no edges and log when the extraction throws', async () => {
    const container = containerBootstrap();
    const manager = new BuiltinCompromise({ container });
    const logger: any = container.get('logger');
    const spy = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    try {
      const actual = await manager.findBuiltinEntities('anything');
      expect(actual).toEqual({ edges: [] });
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toBeInstanceOf(Error);
    } finally {
      spy.mockRestore();
    }
  });

  test('It should keep the input untouched when the extraction throws', async () => {
    const container = containerBootstrap();
    const manager = new BuiltinCompromise({ container });
    const logger: any = container.get('logger');
    const spy = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    try {
      const actual = await manager.extract({
        utterance: 'anything',
        locale: 'en',
      });
      expect(actual.edges).toEqual([]);
      expect(actual.sourceEntities).toEqual([]);
    } finally {
      spy.mockRestore();
    }
  });
});
