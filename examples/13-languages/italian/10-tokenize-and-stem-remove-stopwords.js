import { StemmerIt, StopwordsIt } from '../../../packages/lang-it/src/index.js';
// import { StemmerIt, StopwordsIt } from '@nlpjs-neo/lang-it';

const stemmer = new StemmerIt();
stemmer.stopwords = new StopwordsIt();
const input = 'Ho visto uno sviluppatore';
console.log(stemmer.tokenizeAndStem(input, false));
// output: [ 'vist', 'svilupp' ]
