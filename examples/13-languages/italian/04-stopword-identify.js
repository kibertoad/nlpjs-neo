import { StopwordsIt } from '../../../packages/lang-it/src/index.js';
// import { StopwordsIt } from '@nlpjs-neo/lang-it';

const stopwords = new StopwordsIt();
console.log(stopwords.isStopword('uno'));
// output: true
console.log(stopwords.isStopword('sviluppatore'));
// output: false
