import { NormalizerEs } from '../../../packages/lang-es/src/index.js';
// import { NormalizerEs } from '@nlpjs-neo/lang-es';

const normalizer = new NormalizerEs();
const input = 'Esto debería ser normalizado';
const result = normalizer.normalize(input);
console.log(result);
// output: esto deberia ser normalizado
