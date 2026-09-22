import { NeuralNetwork } from '../src/index.js';
import corpus from './corpus.json' with { type: 'json' };

describe('Neural Network', () => {
  describe('Constructor', () => {
    test('Should create an instance', () => {
      const net = new NeuralNetwork();
      expect(net).toBeDefined();
    });

    test('An untrained network explains nothing and initializes nothing', () => {
      const net = new NeuralNetwork();
      expect(net.explain({ feature: 1 }, 'intent')).toEqual({});
      expect(() => net.verifyIsInitialized()).not.toThrow();
      expect(net.perceptrons).toBeUndefined();
    });

    test('If log setting is true should create a log function', () => {
      const net = new NeuralNetwork({ log: true });
      expect(typeof net.logFn).toEqual('function');
    });

    test('A log function can be provided', () => {
      let logCalls = 0;
      const net = new NeuralNetwork({
        log: () => {
          logCalls += 1;
        },
      });
      expect(typeof net.logFn).toEqual('function');
      expect(logCalls).toEqual(0);
    });
  });

  describe('Train', () => {
    test('Train and run', () => {
      const net = new NeuralNetwork();
      net.train(corpus);
      const actual = net.run({ when: 1, birthday: 1 });
      expect(actual.who).toEqual(0);
      expect(actual.developer).toEqual(0);
      expect(actual.birthday).toBeGreaterThan(0.75);
    });
    test('Train process can be logged', () => {
      const net = new NeuralNetwork({ log: true });
      net.train(corpus);
      const actual = net.run({ when: 1, birthday: 1 });
      expect(actual.who).toEqual(0);
      expect(actual.developer).toEqual(0);
      expect(actual.birthday).toBeGreaterThan(0.75);
    });
    test('Can be trained with none feature', () => {
      const net = new NeuralNetwork();
      net.train([
        ...corpus,
        { input: { nonefeature: 1 }, output: { None: 1 } },
      ]);
      const actual = net.run({ when: 1, birthday: 1 });
      expect(actual.who).toEqual(0);
      expect(actual.developer).toEqual(0);
      expect(actual.birthday).toBeGreaterThan(0.75);
    });
    test('If run is called without train return undefined', () => {
      const net = new NeuralNetwork();
      const actual = net.run({ when: 1, birthday: 1 });
      expect(actual).toBeUndefined();
    });
  });

  describe('Learning rate', () => {
    test('It is derived from the size of the corpus when it is `auto`', () => {
      const net = new NeuralNetwork();
      expect(net.settings.learningRate).toEqual('auto');
      expect(net.baseLearningRate).toBeUndefined();
      net.train(corpus);
      expect(net.settings.learningRate).toEqual('auto');
      expect(net.baseLearningRate).toBeCloseTo(
        1 / Math.sqrt(corpus.length),
        10
      );
    });

    test('A bigger corpus learns slower', () => {
      const big = Array.from({ length: 4 }, () => corpus).flat();
      const small = new NeuralNetwork();
      small.train(corpus);
      const large = new NeuralNetwork();
      large.train(big);
      expect(large.baseLearningRate).toBeCloseTo(
        small.baseLearningRate / 2,
        10
      );
    });

    test('A learning rate in the settings is used as it is', () => {
      const net = new NeuralNetwork({ learningRate: 0.01 });
      expect(net.settings.learningRate).toEqual(0.01);
      net.train(corpus);
      expect(net.baseLearningRate).toEqual(0.01);
    });

    test('An `auto` rate is not exported, a pinned one is', () => {
      const auto = new NeuralNetwork();
      auto.train(corpus);
      expect(auto.toJSON().settings).toEqual({});

      const pinned = new NeuralNetwork({ learningRate: 0.01 });
      pinned.train(corpus);
      expect(pinned.toJSON().settings).toEqual({ learningRate: 0.01 });

      const imported = new NeuralNetwork();
      imported.fromJSON(pinned.toJSON());
      expect(imported.settings.learningRate).toEqual(0.01);
    });

    test('A model exported before `learningRate` existed trains on `auto` once imported', () => {
      // A model from a release before this one has no `learningRate` in its
      // settings either: the old `toJSON` stripped it once it equalled the
      // old default, 0.6, and 0.6 was the only default there was. That is the
      // same shape `{}` an `auto` export has today (the test above), so it is
      // what `fromJSON` sees; it cannot tell the two apart.
      const legacy = new NeuralNetwork();
      legacy.train(corpus);
      const json = legacy.toJSON();
      expect(json.settings.learningRate).toBeUndefined();

      const imported = new NeuralNetwork();
      imported.fromJSON(json);
      expect(imported.settings.learningRate).toEqual('auto');

      // Training the imported model resolves the rate from its corpus, same
      // as a network that was never exported, not the 0.6 it trained with
      // originally: a model kept training across the version bump learns at
      // a different pace than it did before, even though its saved weights
      // are unchanged and score exactly as they did.
      imported.train(corpus);
      expect(imported.baseLearningRate).toEqual(1 / Math.sqrt(corpus.length));
      expect(imported.baseLearningRate).not.toEqual(0.6);
    });
  });

  describe('Inputs', () => {
    test('The known features of an input keep their values, in order', () => {
      const net = new NeuralNetwork();
      net.train(corpus);
      const { inputLookup } = net.lookup;
      const vector = net.lookup.transformInput({
        unknown: 5,
        when: 2,
        birthday: 3,
      });
      expect(vector.keys).toEqual([
        inputLookup.dict.get('when'),
        inputLookup.dict.get('birthday'),
      ]);
      expect(vector.values).toEqual([2, 3]);
    });

    test('A feature named like a member of Object is just a feature', () => {
      const net = new NeuralNetwork();
      net.train(corpus);
      // `run` answers one object it reuses, so it is copied before the next run.
      const plain = { ...net.run({ when: 1, birthday: 1 }) };
      const actual = net.run({
        when: 1,
        birthday: 1,
        constructor: 1,
        toString: 1,
        valueOf: 1,
      });
      expect(actual).toEqual(plain);
      expect(Number.isNaN(actual.birthday)).toBe(false);
    });
  });

  describe('Import and export', () => {
    test('Should export and import', () => {
      const net = new NeuralNetwork();
      net.train(corpus);
      const json = net.toJSON();
      const net2 = new NeuralNetwork();
      net2.fromJSON(json);
      const actual = net2.run({ when: 1, birthday: 1 });
      expect(actual.who).toEqual(0);
      expect(actual.developer).toEqual(0);
      expect(actual.birthday).toBeGreaterThan(0.75);
    });
  });

  describe('Explain', () => {
    test('explain', () => {
      const net = new NeuralNetwork();
      net.train(corpus);
      const explanation = net.explain({ when: 1, birthday: 1 }, 'birthday');
      expect(explanation.weights).toBeDefined();
      expect(explanation.weights.when).toEqual(7.89713716506958);
      expect(explanation.weights.birthday).toEqual(6.401824951171875);
      expect(explanation.bias).toEqual(-0.14768101345231271);
    });
  });
});
