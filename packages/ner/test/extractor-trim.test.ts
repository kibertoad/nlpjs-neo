import { Ner, ExtractorTrim } from '../src/index.js';

describe('Extractor Trim', () => {
  describe('Constructor', () => {
    test('It should create an instance', () => {
      const instance = new ExtractorTrim();
      expect(instance).toBeDefined();
    });
  });

  describe('Extract', () => {
    test('It should extract a between rule', async () => {
      const ner = new Ner();
      ner.addBetweenCondition('en', 'entity', 'from', 'to');
      const input = {
        text: 'I have to go from Madrid to Barcelona',
        locale: 'en',
      };
      const actual = await ner.process(input);
      expect(actual.entities).toEqual([
        {
          start: 18,
          end: 23,
          accuracy: 1,
          sourceText: 'Madrid',
          entity: 'entity',
          type: 'trim',
          subtype: 'between',
          utteranceText: 'Madrid',
          len: 6,
        },
      ]);
    });

    test('It should not extract an empty entity', async () => {
      const ner = new Ner();
      ner.addBeforeFirstCondition('en', 'entity', 'profile');
      ner.addAfterLastCondition('en', 'entity', 'of');
      const input = {
        text: 'profile of',
        locale: 'en',
      };
      const actual = await ner.process(input);
      expect(actual.entities).toEqual([]);
    });

    test('It should extract an entity when one trim rule matches', async () => {
      const ner = new Ner();
      ner.addBeforeFirstCondition('en', 'entity', 'profile');
      ner.addAfterLastCondition('en', 'entity', 'of');
      const input = {
        text: 'profile of User',
        locale: 'en',
      };
      const actual = await ner.process(input);
      expect(actual.entities).toEqual([
        {
          accuracy: 0.99,
          end: 14,
          entity: 'entity',
          len: 4,
          sourceText: 'User',
          start: 11,
          subtype: 'afterLast',
          type: 'trim',
          utteranceText: 'User',
        },
      ]);
    });
    test('It should extract two entities when two trim rule matches', async () => {
      const ner = new Ner();
      ner.addBeforeFirstCondition('en', 'entity', 'profile');
      ner.addAfterLastCondition('en', 'entity', 'of');
      const input = {
        text: 'First profile of User',
        locale: 'en',
      };
      const actual = await ner.process(input);
      expect(actual.entities).toEqual([
        {
          accuracy: 0.99,
          end: 4,
          entity: 'entity',
          len: 5,
          sourceText: 'First',
          start: 0,
          subtype: 'beforeFirst',
          type: 'trim',
          utteranceText: 'First',
        },
        {
          accuracy: 0.99,
          end: 20,
          entity: 'entity',
          len: 4,
          sourceText: 'User',
          start: 17,
          subtype: 'afterLast',
          type: 'trim',
          utteranceText: 'User',
        },
      ]);
    });

    test('It should extract a between rule finding simplest solution', async () => {
      const ner = new Ner();
      ner.addBetweenCondition('en', 'destination', ['to'], ['from']);
      const input = {
        text: 'I want to travel to Madrid from Barcelona',
        locale: 'en',
      };
      const actual = await ner.process(input);
      expect(actual.entities).toEqual([
        {
          type: 'trim',
          subtype: 'between',
          start: 10,
          end: 25,
          len: 16,
          accuracy: 1,
          sourceText: 'travel to Madrid',
          utteranceText: 'travel to Madrid',
          entity: 'destination',
        },
      ]);
    });

    test('It should extract a between rule finding closest solution', async () => {
      const ner = new Ner();
      ner.addBetweenLastCondition('en', 'destination', ['to'], ['from']);
      const input = {
        text: 'I want to travel to Madrid from Barcelona',
        locale: 'en',
      };
      const actual = await ner.process(input);
      expect(actual.entities).toEqual([
        {
          type: 'trim',
          subtype: 'between',
          start: 20,
          end: 25,
          len: 6,
          accuracy: 1,
          sourceText: 'Madrid',
          utteranceText: 'Madrid',
          entity: 'destination',
        },
      ]);
    });

    test('It should extract a get before rule', async () => {
      const ner = new Ner();
      ner.addBeforeCondition('en', 'entity', 'from');
      const input = {
        text: 'I have to go from Madrid from Barcelona',
        locale: 'en',
      };
      const actual = await ner.process(input);
      expect(actual.entities).toEqual([
        {
          type: 'trim',
          subtype: 'before',
          start: 0,
          end: 11,
          len: 12,
          accuracy: 0.99,
          sourceText: 'I have to go',
          utteranceText: 'I have to go',
          entity: 'entity',
        },
        {
          type: 'trim',
          subtype: 'before',
          start: 18,
          end: 23,
          len: 6,
          accuracy: 0.99,
          sourceText: 'Madrid',
          utteranceText: 'Madrid',
          entity: 'entity',
        },
      ]);
    });
    test('It should extract a get before last rule', async () => {
      const ner = new Ner();
      ner.addBeforeLastCondition('en', 'entity', 'from');
      const input = {
        text: 'I have to go from Madrid from Barcelona',
        locale: 'en',
      };
      const actual = await ner.process(input);
      expect(actual.entities).toEqual([
        {
          type: 'trim',
          subtype: 'beforeLast',
          start: 0,
          end: 23,
          len: 24,
          accuracy: 0.99,
          sourceText: 'I have to go from Madrid',
          utteranceText: 'I have to go from Madrid',
          entity: 'entity',
        },
      ]);
    });
    test('It should extract a get before first rule', async () => {
      const ner = new Ner();
      ner.addBeforeFirstCondition('en', 'entity', 'from');
      const input = {
        text: 'I have to go from Madrid from Barcelona',
        locale: 'en',
      };
      const actual = await ner.process(input);
      expect(actual.entities).toEqual([
        {
          type: 'trim',
          subtype: 'beforeFirst',
          start: 0,
          end: 11,
          len: 12,
          accuracy: 0.99,
          sourceText: 'I have to go',
          utteranceText: 'I have to go',
          entity: 'entity',
        },
      ]);
    });
    test('It should extract a get after rule', async () => {
      const ner = new Ner();
      ner.addAfterCondition('en', 'entity', 'from');
      const input = {
        text: 'I have to go from Madrid from Barcelona',
        locale: 'en',
      };
      const actual = await ner.process(input);
      expect(actual.entities).toEqual([
        {
          type: 'trim',
          subtype: 'after',
          start: 18,
          end: 23,
          len: 6,
          accuracy: 0.99,
          sourceText: 'Madrid',
          utteranceText: 'Madrid',
          entity: 'entity',
        },
        {
          type: 'trim',
          subtype: 'after',
          start: 30,
          end: 38,
          len: 9,
          accuracy: 0.99,
          sourceText: 'Barcelona',
          utteranceText: 'Barcelona',
          entity: 'entity',
        },
      ]);
    });
    test('It honors case-sensitive after conditions', async () => {
      const ner = new Ner();
      ner.addAfterCondition('en', 'entity', 'From', { caseSensitive: true });
      const actual = await ner.process({ text: 'from Madrid', locale: 'en' });
      expect(actual.entities).toEqual([]);
    });
    test('It honors no-space after conditions', async () => {
      const ner = new Ner();
      ner.addAfterCondition('en', 'entity', 'from', { noSpaces: true });
      const actual = await ner.process({ text: 'fromMadrid', locale: 'en' });
      expect(actual.entities[0].sourceText).toEqual('Madrid');
    });
    test('It should extract a get after first rule', async () => {
      const ner = new Ner();
      ner.addAfterFirstCondition('en', 'entity', 'from');
      const input = {
        text: 'I have to go from Madrid from Barcelona',
        locale: 'en',
      };
      const actual = await ner.process(input);
      expect(actual.entities).toEqual([
        {
          type: 'trim',
          subtype: 'afterFirst',
          start: 18,
          end: 38,
          len: 21,
          accuracy: 0.99,
          sourceText: 'Madrid from Barcelona',
          utteranceText: 'Madrid from Barcelona',
          entity: 'entity',
        },
      ]);
    });
    test('It should extract a get after last rule', async () => {
      const ner = new Ner();
      ner.addAfterLastCondition('en', 'entity', 'from');
      const input = {
        text: 'I have to go from Madrid from Barcelona',
        locale: 'en',
      };
      const actual = await ner.process(input);
      expect(actual.entities).toEqual([
        {
          type: 'trim',
          subtype: 'afterLast',
          start: 30,
          end: 38,
          len: 9,
          accuracy: 0.99,
          sourceText: 'Barcelona',
          utteranceText: 'Barcelona',
          entity: 'entity',
        },
      ]);
    });

    test('It should be able to retrieve at start of utterance', async () => {
      const ner = new Ner();
      ner.addAfterLastCondition('en', 'entity', 'from');
      const input = {
        text: 'from Barcelona to Madrid',
        locale: 'en',
      };
      const actual = await ner.process(input);
      expect(actual.entities).toEqual([
        {
          type: 'trim',
          subtype: 'afterLast',
          start: 5,
          end: 23,
          len: 19,
          accuracy: 0.99,
          sourceText: 'Barcelona to Madrid',
          utteranceText: 'Barcelona to Madrid',
          entity: 'entity',
        },
      ]);
    });
  });
});
