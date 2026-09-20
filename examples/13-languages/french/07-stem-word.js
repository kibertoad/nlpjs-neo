import { StemmerFr } from '../../../packages/lang-fr/src/index.js';

const stemmer = new StemmerFr();
const input = 'sortir';
console.log(stemmer.stemWord(input));
// output: sort
