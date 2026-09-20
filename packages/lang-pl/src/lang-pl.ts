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

import TokenizerPl from './tokenizer-pl.js';
import StemmerPl from './stemmer-pl.js';
import StopwordsPl from './stopwords-pl.js';
import NormalizerPl from './normalizer-pl.js';
import SentimentPl from './sentiment/sentiment_pl.js';
import registerTrigrams from './trigrams.js';

class LangPl {
  register(container) {
    container.use(TokenizerPl);
    container.use(StemmerPl);
    container.use(StopwordsPl);
    container.use(NormalizerPl);
    container.register('sentiment-pl', SentimentPl);
    registerTrigrams(container);
  }
}

export default LangPl;
