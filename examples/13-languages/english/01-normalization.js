import { NormalizerEn } from '../../../packages/lang-en/src/index.js';
// import { NormalizerEn } from '@nlpjs-neo/lang-en';

const normalizer = new NormalizerEn();
const input = 'This shóuld be normalized';
const result = normalizer.normalize(input);
console.log(result);
// output: this should be normalized
