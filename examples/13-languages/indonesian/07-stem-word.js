import { StemmerId } from '../../../packages/lang-id/src/index.js';
// import { StemmerId } from '@nlpjs-neo/lang-id';

const stemmer = new StemmerId();
const input = 'dikembangkan';
console.log(stemmer.stemWord(input));
// output: kembang
