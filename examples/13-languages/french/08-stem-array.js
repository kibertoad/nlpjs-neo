import { StemmerFr } from '../../../packages/lang-fr/src/index.js';

const stemmer = new StemmerFr();
const input = ['Je', 'veux', "qu'il", 'sortir'];
console.log(stemmer.stem(input));
// outuput: [ 'Je', 'veux', "qu'il", 'sort' ]
