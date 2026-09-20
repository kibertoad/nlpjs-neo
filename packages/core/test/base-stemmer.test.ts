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

import BaseStemmer from '../src/base-stemmer.js';

class TestStemmer extends BaseStemmer {
  constructor(container) {
    super(container);
    this.name = 'stemmer-en';
  }

  innerStem() {}
}

describe('BaseStemmer', () => {
  test('removes stopwords when tokenizeAndStem is asked not to keep them', () => {
    const container = {
      get(name) {
        if (name === 'tokenizer-en') {
          return { tokenize: () => ['the', 'cat'] };
        }
        if (name === 'stopwords-en') {
          return { removeStopwords: (tokens) => tokens.filter((x) => x !== 'the') };
        }
        return undefined;
      },
    };
    const stemmer = new TestStemmer(container);

    expect(stemmer.tokenizeAndStem('the cat', false)).toEqual(['cat']);
  });
});
