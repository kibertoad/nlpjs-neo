import { StopwordsId } from '../../../packages/lang-id/src/index.js';
// import { StopwordsId } from '@nlpjs-neo/lang-id';

const stopwords = new StopwordsId();
console.log(stopwords.isStopword('apa'));
// output: true
console.log(stopwords.isStopword('perusahaan'));
// output: false
