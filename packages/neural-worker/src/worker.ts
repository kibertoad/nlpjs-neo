import { workerData, parentPort } from 'worker_threads';
import NeuralNetwork from './neural-network.js';

const network = new NeuralNetwork(workerData.settings);
const status = network.train(workerData.data);
parentPort.postMessage({ json: network.toJSON(), status });
