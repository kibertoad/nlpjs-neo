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

import { Language } from './language/index.js';
import { NlpUtil, NlpManager, NlpExcelReader } from './nlp/index.js';
import { XTableUtils, XTable, XDoc } from './xtables/index.js';
import {
  removeEmojis,
  Evaluator,
  SpellCheck,
  Handlebars,
} from './util/index.js';
import { ActionManager, NlgManager } from './nlg/index.js';
import { NeuralNetwork } from './classifiers/index.js';
import { SentimentAnalyzer, SentimentManager } from './sentiment/index.js';
import {
  Recognizer,
  ConversationContext,
  MemoryConversationContext,
} from './recognizer/index.js';
import { BrainNLU } from './nlu/index.js';

export {
  Language,
  NlpUtil,
  NlpManager,
  NlpExcelReader,
  XTableUtils,
  XTable,
  XDoc,
  removeEmojis,
  Evaluator,
  SpellCheck,
  Handlebars,
  ActionManager,
  NlgManager,
  NeuralNetwork,
  SentimentAnalyzer,
  SentimentManager,
  Recognizer,
  ConversationContext,
  MemoryConversationContext,
  BrainNLU,
};
