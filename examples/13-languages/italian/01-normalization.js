import { NormalizerIt } from '../../../packages/lang-it/src/index.js';
// import { NormalizerIt } from '@nlpjs-neo/lang-it';

const normalizer = new NormalizerIt();
const input = 'Questo dòvrebbe essere normalizzato';
const result = normalizer.normalize(input);
console.log(result);
// output: questo dovrebbe essere normalizzato
