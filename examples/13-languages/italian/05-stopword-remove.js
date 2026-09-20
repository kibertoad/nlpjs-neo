import { StopwordsIt } from '../../../packages/lang-it/src/index.js';
// import { StopwordsIt } from '@nlpjs-neo/lang-it';

const stopwords = new StopwordsIt();
console.log(stopwords.removeStopwords(['ho', 'visto', 'uno', 'sviluppatore']));
// output: [ 'visto', 'sviluppatore' ]
