import { StemmerEs } from '../../../packages/lang-es/src/index.js';
// import { StemmerEs } from '@nlpjs-neo/lang-es';

const stemmer = new StemmerEs();
const input = 'He visto a un PROGRAMADOR';
console.log(stemmer.tokenizeAndStem(input));
// output: [ 'hab', 'vist', 'a', 'un', 'program' ]
