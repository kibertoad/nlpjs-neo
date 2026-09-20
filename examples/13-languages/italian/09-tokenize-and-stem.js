import { StemmerIt } from '../../../packages/lang-it/src/index.js';
// import { StemmerIt } from '@nlpjs-neo/lang-it';

const stemmer = new StemmerIt();
const input = 'Ho visto uno sviluppatore';
console.log(stemmer.tokenizeAndStem(input));
// output: [ 'ho', 'vist', 'uno', 'svilupp' ]
