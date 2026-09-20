import { StemmerEs } from '../../../packages/lang-es/src/index.js';
// import { StemmerEs } from '@nlpjs-neo/lang-es';

const stemmer = new StemmerEs();
const input = ['he', 'visto', 'a', 'un', 'programador'];
console.log(stemmer.stem(input));
// outuput: [ 'hab', 'vist', 'a', 'un', 'program' ]
