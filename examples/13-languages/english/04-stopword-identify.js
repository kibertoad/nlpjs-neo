import { StopwordsEn } from '../../../packages/lang-en/src/index.js';
// import { StopwordsEn } from '@nlpjs-neo/lang-en';

const stopwords = new StopwordsEn();
console.log(stopwords.isStopword('is'));
// output: true
console.log(stopwords.isStopword('developer'));
// output: false
