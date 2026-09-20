import { StopwordsEn } from '../../../packages/lang-en/src/index.js';
// import { StopwordsEn } from '@nlpjs-neo/lang-en';

const stopwords = new StopwordsEn();
stopwords.dictionary = {};
stopwords.build(['is', 'your']);
console.log(stopwords.removeStopwords(['who', 'is', 'your', 'develop']));
// output: ['who', 'develop']
