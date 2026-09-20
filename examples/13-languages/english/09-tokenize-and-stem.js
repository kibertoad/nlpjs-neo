import { StemmerEn } from '../../../packages/lang-en/src/index.js';
// import { StemmerEn } from '@nlpjs-neo/lang-en';

const stemmer = new StemmerEn();
const input = 'Who is your DEVELOPER';
console.log(stemmer.tokenizeAndStem(input));
// output: [ 'who', 'is', 'your', 'develop' ]
