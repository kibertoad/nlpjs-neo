import { StemmerEs } from '../../../packages/lang-es/src/index.js';
// import { StemmerEs } from '@nlpjs-neo/lang-es';

const stemmer = new StemmerEs();
const input = 'programador';
console.log(stemmer.stemWord(input));
// output: program
