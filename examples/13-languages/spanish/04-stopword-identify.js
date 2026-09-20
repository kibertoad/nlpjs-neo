import { StopwordsEs } from '../../../packages/lang-es/src/index.js';
// import { StopwordsEs } from '@nlpjs-neo/lang-es';

const stopwords = new StopwordsEs();
console.log(stopwords.isStopword('un'));
// output: true
console.log(stopwords.isStopword('desarrollador'));
// output: false
