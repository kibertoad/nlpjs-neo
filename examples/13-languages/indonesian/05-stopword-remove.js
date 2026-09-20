import { StopwordsId } from '../../../packages/lang-id/src/index.js';
// import { StopwordsId } from '@nlpjs-neo/lang-id';

const stopwords = new StopwordsId();
console.log(
  stopwords.removeStopwords([
    'apa',
    'yang',
    'dikembangkan',
    'perusahaan',
    'anda',
  ])
);
// output: [ 'dikembangkan', 'perusahaan' ]
