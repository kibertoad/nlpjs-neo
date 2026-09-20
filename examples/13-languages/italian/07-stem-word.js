import { StemmerIt } from '../../../packages/lang-it/src/index.js';
// import { StemmerIt } from '@nlpjs-neo/lang-it';

const stemmer = new StemmerIt();
const input = 'svilupp';
console.log(stemmer.stemWord(input));
// output: program
