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

import TokenizerRu from './tokenizer-ru.js';
import StemmerRu from './stemmer-ru.js';
import StopwordsRu from './stopwords-ru.js';
import NormalizerRu from './normalizer-ru.js';
import SentimentRu from './sentiment/sentiment_ru.js';
import registerTrigrams from './trigrams.js';

class LangRu {
  register(container) {
    container.use(TokenizerRu);
    container.use(StemmerRu);
    container.use(StopwordsRu);
    container.use(NormalizerRu);
    container.register('sentiment-ru', SentimentRu);
    registerTrigrams(container);
  }
}

export default LangRu;
