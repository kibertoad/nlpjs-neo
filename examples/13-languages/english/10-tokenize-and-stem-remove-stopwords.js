import { StemmerEn, StopwordsEn } from '../../../packages/lang-en/src/index.js';
// import { StemmerEn, StopwordsEn } from '@nlpjs-neo/lang-en';

const stemmer = new StemmerEn();
stemmer.stopwords = new StopwordsEn();
const input = 'who is your developer';
console.log(stemmer.tokenizeAndStem(input, false));
// output: ['develop']
