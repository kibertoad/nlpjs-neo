import { StopwordsId } from '../../../packages/lang-id/src/index.js';
// import { StopwordsId } from '@nlpjs-neo/lang-id';

const stopwords = new StopwordsId();
stopwords.dictionary = {};
stopwords.build(['apa', 'anda']);
console.log(
  stopwords.removeStopwords([
    'apa',
    'yang',
    'dikembangkan',
    'perusahaan',
    'anda',
  ])
);
// output: [ 'yang', 'dikembangkan', 'perusahaan' ]
