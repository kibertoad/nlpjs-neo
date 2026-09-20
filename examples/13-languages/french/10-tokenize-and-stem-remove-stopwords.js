import { StemmerFr, StopwordsFr } from '../../../packages/lang-fr/src/index.js';

const stemmer = new StemmerFr();
stemmer.stopwords = new StopwordsFr();
const input = 'Qui a crié ?';
console.log(stemmer.tokenizeAndStem(input, false));
// output: [ 'cri' ]
