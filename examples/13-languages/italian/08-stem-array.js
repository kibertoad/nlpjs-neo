import { StemmerIt } from '../../../packages/lang-it/src/index.js';
// import { StemmerIt } from '@nlpjs-neo/lang-it';

const stemmer = new StemmerIt();
const input = ['ho', 'visto', 'uno', 'sviluppatore'];
console.log(stemmer.stem(input));
// outuput: [ 'ho', 'vist', 'uno', 'svilupp' ]
