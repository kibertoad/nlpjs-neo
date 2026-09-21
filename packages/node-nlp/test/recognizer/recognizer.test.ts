import { Recognizer } from '../../src/index.js';
import type { RecognizerContext } from '../../src/types.js';

const rulesFile = './packages/node-nlp/test/nlp/rules.xlsx';

/**
 * Builds a recognizer whose model is never written to disk. `loadExcel` saves
 * the trained model as a side effect, and the file name is not configurable
 * from the call, so the save is stubbed rather than redirected.
 */
function buildRecognizer() {
  const recognizer = new Recognizer({ threshold: 0.5 });
  const save = vi.fn<(...args: unknown[]) => void>();
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
    test('It should initialize actions from settings', async () => {
      const action = vi.fn<(...args: unknown[]) => void>();
      const recognizer = new Recognizer({ actions: { greet: action } });
      const context = {};

      await recognizer.executeAction('greet', '"world"', context);

      expect(action).toHaveBeenCalledWith(recognizer, context, 'world');
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
      const context: RecognizerContext = {};
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
