import { StemmerEs, StopwordsEs } from '../../../packages/lang-es/src/index.js';
// import { StemmerEs, StopwordsEs } from '@nlpjs-neo/lang-es';

const stemmer = new StemmerEs();
stemmer.stopwords = new StopwordsEs();
const input = 'he visto a un programador';
console.log(stemmer.tokenizeAndStem(input, false));
// output: ['hab', 'vist', 'program']
