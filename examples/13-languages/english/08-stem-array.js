import { StemmerEn } from '../../../packages/lang-en/src/index.js';
// import { StemmerEn } from '@nlpjs-neo/lang-en';

const stemmer = new StemmerEn();
const input = ['Who', 'is', 'your', 'developer'];
console.log(stemmer.stem(input));
// outuput: [ 'Who', 'is', 'your', 'develop' ]
