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

import { Recognizer } from '../../src/index.js';

const rulesFile = './packages/node-nlp/test/nlp/rules.xlsx';

/**
 * Builds a recognizer whose model is never written to disk. `loadExcel` saves
 * the trained model as a side effect, and the file name is not configurable
 * from the call, so the save is stubbed rather than redirected.
 */
function buildRecognizer() {
  const recognizer = new Recognizer({ threshold: 0.5 });
  const save = vi.fn<(...args: any[]) => void>();
  recognizer.nlpManager.save = save;
  return { recognizer, save };
}

describe('Recognizer', () => {
  describe('Constructor', () => {
    test('It should create an instance', () => {
      const recognizer = new Recognizer();
      expect(recognizer).toBeDefined();
      expect(recognizer.nlpManager).toBeDefined();
      expect(recognizer.conversationContext).toBeDefined();
    });
    test('It should default the threshold to 0.7', () => {
      expect(new Recognizer().threshold).toEqual(0.7);
    });
    test('It should take the threshold from the settings', () => {
      expect(new Recognizer({ threshold: 0.5 }).threshold).toEqual(0.5);
    });
    test('It should reuse an NLP manager given in the settings', () => {
      const nlpManager = { name: 'given' };
      expect(new Recognizer({ nlpManager }).nlpManager).toBe(nlpManager);
    });
  });

  describe('Load excel', () => {
    test('It should have loaded and trained the model once it resolves', async () => {
      const { recognizer, save } = buildRecognizer();
      await recognizer.loadExcel(rulesFile);
      expect(recognizer.nlpManager.nlp.nluManager.locales).toEqual([
        'en',
        'es',
      ]);
      expect(recognizer.nlpManager.nlp.ner.rules.en.hero).toBeDefined();
      expect(save).toHaveBeenCalled();
    }, 30000);

    /*
     * The assertion that matters: a model that was trained before the workbook
     * finished loading answers None to everything it should know.
     */
    test('It should recognize an utterance from the loaded model', async () => {
      const { recognizer } = buildRecognizer();
      await recognizer.loadExcel(rulesFile);
      const result = await recognizer.process({}, 'en', 'who is spiderman?');
      expect(result.intent).toEqual('whois');
      expect(result.score).toBeGreaterThan(0.5);
    }, 30000);
  });

  describe('Process', () => {
    test('It should drop the answer when the score is below the threshold', async () => {
      const { recognizer } = buildRecognizer();
      await recognizer.loadExcel(rulesFile);
      recognizer.threshold = 0.99;
      const result = await recognizer.process({}, 'en', 'xyzzy plugh');
      expect(result.answer).toBeUndefined();
    }, 30000);

    test('It should carry recognized entities into the context', async () => {
      const { recognizer } = buildRecognizer();
      await recognizer.loadExcel(rulesFile);
      const context: any = {};
      await recognizer.process(context, 'en', 'where is spiderman?');
      expect(context.hero).toEqual('spiderman');
    }, 30000);
  });

  describe('Get dialog id', () => {
    test('It should return an empty string when there is no dialog stack', () => {
      expect(new Recognizer().getDialogId({})).toEqual('');
    });
    test('It should return the last developer dialog id', () => {
      const session = {
        dialogStack: () => ['BotBuilder:prompt', '*:greeting'],
      };
      expect(new Recognizer().getDialogId(session)).toEqual('greeting');
    });
    test('It should return an empty string when no developer dialog is on the stack', () => {
      const session = { dialogStack: () => ['BotBuilder:prompt'] };
      expect(new Recognizer().getDialogId(session)).toEqual('');
    });
  });
});
