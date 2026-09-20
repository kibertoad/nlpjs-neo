import { NormalizerFr } from '../../../packages/lang-fr/src/index.js';

const normalizer = new NormalizerFr();
const input = 'Ceci devrait être normalisé, Je dis la vérité non ? ';
const result = normalizer.normalize(input);
console.log(result);
// output: ceci devrait etre normalise, je dis la verite non ?
