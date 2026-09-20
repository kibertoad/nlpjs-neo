import { NormalizerId } from '../../../packages/lang-id/src/index.js';
// import { NormalizerId } from '@nlpjs-neo/lang-id';

const normalizer = new NormalizerId();
const input = 'apa yang dikembangkan perúsahaan Anda';
const result = normalizer.normalize(input);
console.log(result);
// output: apa yang dikembangkan perusahaan anda
