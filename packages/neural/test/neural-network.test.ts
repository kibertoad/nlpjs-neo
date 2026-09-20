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
      expect(explanation.weights.when).toEqual(5.242532253265381);
      expect(explanation.weights.birthday).toEqual(4.492748260498047);
      expect(explanation.bias).toEqual(1.6587271811334132);
    });
  });
});
