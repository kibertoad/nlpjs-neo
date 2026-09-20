import { NeuralNetwork } from '../../packages/neural/src/index.js';
import corpus from './data/corpus.json' with { type: 'json' };

const net = new NeuralNetwork({
  learningRate: 0.01,
  alpha: 0.7,
  momentum: 0.9,
  log: true,
});
net.train(corpus);
console.log(net.run({ when: 1, birthday: 1 }));
