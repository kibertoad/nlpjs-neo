import { StemmerEn } from '../../../packages/lang-en/src/index.js';
// import { StemmerEn } from '@nlpjs-neo/lang-en';

const stemmer = new StemmerEn();
const input = 'developer';
console.log(stemmer.stemWord(input));
// output: develop
