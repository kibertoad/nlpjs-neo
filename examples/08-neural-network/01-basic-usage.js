import { NeuralNetwork } from '../../packages/neural/src/index.js';
import corpus from './data/corpus.json' with { type: 'json' };

const net = new NeuralNetwork();
net.train(corpus);
console.log(net.run({ when: 1, birthday: 1 }));
