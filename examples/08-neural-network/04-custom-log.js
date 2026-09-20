import { NeuralNetwork } from '../../packages/neural/src/index.js';
import corpus from './data/corpus.json' with { type: 'json' };

let totalTime = 0;
function customLog(status, elapsed) {
  totalTime += elapsed;
  console.log(
    `Epoch ${status.iterations} Loss: ${status.error} Time: ${totalTime}ms`
  );
}

const net = new NeuralNetwork({ log: customLog });
net.train(corpus);
console.log(net.run({ when: 1, birthday: 1 }));
