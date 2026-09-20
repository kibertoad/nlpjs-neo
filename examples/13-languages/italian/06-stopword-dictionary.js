import { StopwordsIt } from '../../../packages/lang-it/src/index.js';
// import { StopwordsIt } from '@nlpjs-neo/lang-it';

const stopwords = new StopwordsIt();
stopwords.dictionary = {};
stopwords.build(['ho', 'visto']);
console.log(stopwords.removeStopwords(['ho', 'visto', 'uno', 'sviluppatore']));
// output: [ 'uno', 'sviluppatore' ]
