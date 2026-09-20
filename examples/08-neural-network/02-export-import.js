import { NeuralNetwork } from '../../packages/neural/src/index.js';
import corpus from './data/corpus.json' with { type: 'json' };

let net = new NeuralNetwork();
net.train(corpus);
const model = net.toJSON();
net = new NeuralNetwork();
net.fromJSON(model);
console.log(net.run({ when: 1, birthday: 1 }));
