import { StemmerId } from '../../../packages/lang-id/src/index.js';
// import { StemmerId } from '@nlpjs-neo/lang-id';

const stemmer = new StemmerId();
const input = 'apa yang dikembangkan PERUSAHAAN Anda';
console.log(stemmer.tokenizeAndStem(input));
// output: [ 'apa', 'yang', 'kembang', 'usaha', 'anda' ]
