import { StemmerFr } from '../../../packages/lang-fr/src/index.js';

const stemmer = new StemmerFr();
const input = "Je veux qu'il sortir";
console.log(stemmer.tokenizeAndStem(input));
// output: [ 'je', 'veux', 'qu', 'il', 'sort' ]
