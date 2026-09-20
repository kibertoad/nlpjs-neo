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

import NGrams from './ngrams.js';
import TfIdf from './tfidf.js';
import MarkovChain from './markov.js';
import NlpAnalyzer from './nlp-analyzer.js';
import {
  cartesian,
  splitPattern,
  composeFromPattern,
  composeCorpus,
} from './pattern.js';
import ProgressBar from './progress-bar.js';
import softMax from './softmax.js';
import Downloader from './downloader.js';
import { getAbsolutePath } from './fs-extra.js';
import Lookup from './lookup.js';
import CorpusLookup from './corpus-lookup.js';
import Bench from './bench.js';
import { gibberishScore, isGibberish } from './is-gibberish.js';

export {
  NGrams,
  TfIdf,
  MarkovChain,
  NlpAnalyzer,
  cartesian,
  splitPattern,
  composeFromPattern,
  composeCorpus,
  ProgressBar,
  softMax,
  Downloader,
  getAbsolutePath,
  Lookup,
  CorpusLookup,
  Bench,
  gibberishScore,
  isGibberish,
};
