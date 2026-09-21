import container from './bootstrap.js';
import type { CorpusEntry, FeatureSet } from '../src/index.js';
import Nlu from '../src/nlu.js';
import srccorpus from './corpus50.json' with { type: 'json' };

const corpus: CorpusEntry[] = [];
for (let i = 0; i < srccorpus.data.length; i += 1) {
  const { intent, utterances } = srccorpus.data[i];
  for (let j = 0; j < utterances.length; j += 1) {
    corpus.push({ utterance: utterances[j], intent });
  }
}

describe('NLU', () => {
  describe('Constructor', () => {
    test('An instance can be created', () => {
      const nlu = new Nlu();
      expect(nlu).toBeDefined();
    });
    test('Some settings are by default', () => {
      const nlu = new Nlu();
      expect(nlu.settings.locale).toEqual('en');
      expect(nlu.settings.keepStopwords).toBeTruthy();
      expect(nlu.settings.nonefeatureValue).toEqual(1);
      expect(nlu.settings.nonedeltaMultiplier).toEqual(1.2);
      expect(nlu.settings.spellCheckDistance).toEqual(1);
    });
    test('The settings can be provided in constructor', () => {
      const nlu = new Nlu({ locale: 'fr', keepStopwords: false });
      expect(nlu.settings.locale).toEqual('fr');
      expect(nlu.settings.keepStopwords).toBeFalsy();
      expect(nlu.settings.nonefeatureValue).toEqual(1);
      expect(nlu.settings.nonedeltaMultiplier).toEqual(1.2);
      expect(nlu.settings.spellCheckDistance).toEqual(1);
    });
    test('The settings are forwarded to spell checker constructor', () => {
      const nlu = new Nlu({
        spellCheckDistance: 3,
        spellCheck: true,
        minLength: 2,
      });
      expect(nlu.spellCheck.settings.spellCheckDistance).toEqual(3);
      expect(nlu.spellCheck.settings.spellCheck).toBeTruthy();
      expect(nlu.spellCheck.settings.minLength).toEqual(2);
    });
  });

  describe('Prepare', () => {
    test('Prepare will generate an array of tokens', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const input = 'Allí hay un ratón';
      const actual = await nlu.prepare(input);
      expect(actual).toEqual({
        alli: 1,
        hay: 1,
        un: 1,
        raton: 1,
      });
    });
    test('Prepare should throw and exception if no text available', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const input = 7;
      await expect(nlu.prepare(input)).rejects.toThrow(
        'Error at nlu.prepare: expected a text but received 7'
      );
    });
    test('Prepare should throw and exception if is an object with no text available', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const input = { something: 'something' };
      await expect(nlu.prepare(input)).rejects.toThrow(
        'Error at nlu.prepare: expected a text but received [object Object]'
      );
    });
    test('Prepare can tolerate zero-byte string texts', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const input = '';
      const actual = await nlu.prepare(input);
      expect(actual).toEqual({});
    });
    test('Prepare can process an array of strings', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const input = ['Allí hay un ratón', 'y vino el señor doctor'];
      const actual = await nlu.prepare(input);
      expect(actual).toEqual([
        { alli: 1, hay: 1, un: 1, raton: 1 },
        { y: 1, vino: 1, el: 1, senor: 1, doctor: 1 },
      ]);
    });
    test('Prepare can process an object with text', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const input = { text: 'Allí hay un ratón', intent: 'mouse' };
      const actual = await nlu.prepare(input);
      expect(actual).toEqual({
        text: 'Allí hay un ratón',
        tokens: { alli: 1, hay: 1, un: 1, raton: 1 },
        intent: 'mouse',
      });
    });
    test('Prepare can process an object with utterance', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const input = { utterance: 'Allí hay un ratón', intent: 'mouse' };
      const actual = await nlu.prepare(input);
      expect(actual).toEqual({
        utterance: 'Allí hay un ratón',
        tokens: { alli: 1, hay: 1, un: 1, raton: 1 },
        intent: 'mouse',
      });
    });
    test('Prepare can be called twice', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const input = { utterance: 'Allí hay un ratón', intent: 'mouse' };
      let actual = await nlu.prepare(input);
      actual = await nlu.prepare(input);
      expect(actual).toEqual({
        utterance: 'Allí hay un ratón',
        tokens: { alli: 1, hay: 1, un: 1, raton: 1 },
        intent: 'mouse',
      });
    });
    test('Prepare can process an array of objects with text', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const input = [
        { text: 'Allí hay un ratón', intent: 'mouse' },
        { text: 'y vino el señor doctor', intent: 'doctor' },
      ];
      const actual = await nlu.prepare(input);
      expect(actual).toEqual([
        {
          text: 'Allí hay un ratón',
          tokens: { alli: 1, hay: 1, un: 1, raton: 1 },
          intent: 'mouse',
        },
        {
          text: 'y vino el señor doctor',
          tokens: { y: 1, vino: 1, el: 1, senor: 1, doctor: 1 },
          intent: 'doctor',
        },
      ]);
    });
    test('Prepare can process an array of objects with utterance', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const input = [
        { utterance: 'Allí hay un ratón', intent: 'mouse' },
        { utterance: 'y vino el señor doctor', intent: 'doctor' },
      ];
      const actual = await nlu.prepare(input);
      expect(actual).toEqual([
        {
          utterance: 'Allí hay un ratón',
          tokens: { alli: 1, hay: 1, un: 1, raton: 1 },
          intent: 'mouse',
        },
        {
          utterance: 'y vino el señor doctor',
          tokens: { y: 1, vino: 1, el: 1, senor: 1, doctor: 1 },
          intent: 'doctor',
        },
      ]);
    });
    test('Prepare can process an object with texts array', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const input = {
        intent: 'doctor',
        texts: ['Y vino el señor doctor', 'manejando un cuatrimotor'],
      };
      const actual = await nlu.prepare(input);
      expect(actual).toEqual({
        intent: 'doctor',
        texts: ['Y vino el señor doctor', 'manejando un cuatrimotor'],
        tokens: [
          { y: 1, vino: 1, el: 1, senor: 1, doctor: 1 },
          { manejando: 1, un: 1, cuatrimotor: 1 },
        ],
      });
    });
    test('Prepare can process an object with utterances array', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const input = {
        intent: 'doctor',
        utterances: ['Y vino el señor doctor', 'manejando un cuatrimotor'],
      };
      const actual = await nlu.prepare(input);
      expect(actual).toEqual({
        intent: 'doctor',
        utterances: ['Y vino el señor doctor', 'manejando un cuatrimotor'],
        tokens: [
          { y: 1, vino: 1, el: 1, senor: 1, doctor: 1 },
          { manejando: 1, un: 1, cuatrimotor: 1 },
        ],
      });
    });
    test('Prepare can process an array of objects with texts array', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const input = [
        {
          intent: 'doctor',
          utterances: ['Y vino el señor doctor', 'manejando un cuatrimotor'],
        },
        {
          intent: 'mouse',
          utterances: ['Ahí hay un ratón'],
        },
      ];
      const actual = await nlu.prepare(input);
      expect(actual).toEqual([
        {
          intent: 'doctor',
          utterances: ['Y vino el señor doctor', 'manejando un cuatrimotor'],
          tokens: [
            { y: 1, vino: 1, el: 1, senor: 1, doctor: 1 },
            { manejando: 1, un: 1, cuatrimotor: 1 },
          ],
        },
        {
          intent: 'mouse',
          utterances: ['Ahí hay un ratón'],
          tokens: [{ ahi: 1, hay: 1, un: 1, raton: 1 }],
        },
      ]);
    });
  });

  describe('Prepare corpus', () => {
    test('It should convert strings to word objects', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const actual = await nlu.prepareCorpus({
        corpus,
        settings: nlu.settings,
      });
      expect(actual.corpus).toHaveLength(250);
      expect(actual.corpus[0]).toEqual({
        input: { what: 1, does: 1, your: 1, company: 1, develop: 1 },
        output: { 'support.about': 1 },
      });
    });
    test('It refreshes cached intents after preparing a retrained corpus', async () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      nlu.intentsArr = ['greet', 'None'];

      await nlu.prepareCorpus({
        corpus: [{ utterance: 'pizza', intent: 'food' }],
        settings: nlu.settings,
      });

      const result = nlu.convertToArray({
        classifications: { food: 0.75 },
        settings: nlu.settings,
      });
      expect(result.classifications).toEqual([{ intent: 'food', score: 0.75 }]);
    });
  });

  describe('Add None Feature', () => {
    test('It should add a nonefeature input labeled as None', () => {
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const actual = nlu.addNoneFeature({
        corpus: [],
        settings: { useNoneFeature: true },
      });
      expect(actual.corpus).toHaveLength(1);
      expect(actual.corpus[0]).toEqual({
        input: { nonefeature: 1 },
        output: { None: 1 },
      });
    });
    test('It uses a per-call None feature delta', () => {
      const nlu = new Nlu({ locale: 'en' }, container);
      nlu.numIntents = 1;
      nlu.numFeatures = 1;

      const actual = nlu.textToFeatures({
        tokens: { zzz: 1, qqq: 1 },
        settings: { useNoneFeature: true, nonedeltaValue: 0.5 },
      });

      expect((actual.tokens as FeatureSet).nonefeature).toEqual(1.1);
    });
  });

  describe('fromJSON', () => {
    test('It rebuilds imported classifications with the None intent', () => {
      const nlu = new Nlu({ locale: 'en' }, container);
      nlu.fromJSON({
        settings: {},
        features: {},
        intents: { greet: true },
        featuresToIntent: {},
        intentFeatures: {},
      });

      const result = nlu.convertToArray({
        classifications: { greet: 0.1, None: 0.9 },
        settings: nlu.settings,
      });
      expect(result.classifications).toContainEqual({
        intent: 'None',
        score: 0.9,
      });
    });

    test('It imports a never-trained model without intents', () => {
      const nlu = new Nlu({ locale: 'en' }, container);

      expect(() => nlu.fromJSON({ settings: {} })).not.toThrow();
      expect(nlu.intents).toEqual({});
    });
  });

  describe('Some similar', () => {
    test('It should return false if items in array does not exists in dictionary', () => {
      const dict = { this: 1, is: 1, a: 1, cat: 1 };
      const arr = ['not', 'two', 'dogs'];
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const actual = nlu.someSimilar(dict, arr);
      expect(actual).toBeFalsy();
    });
    test('It should return true if at least one item in array exists in dictionary', () => {
      const dict = { this: 1, is: 1, a: 1, cat: 1 };
      const arr = ['not', 'a', 'cat'];
      const nlu = new Nlu({ locale: 'en', keepStopwords: false }, container);
      const actual = nlu.someSimilar(dict, arr);
      expect(actual).toBeTruthy();
    });
  });
});
