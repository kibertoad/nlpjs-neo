import { StemmerId } from '../../../packages/lang-id/src/index.js';
// import { StemmerId } from '@nlpjs-neo/lang-id';

const stemmer = new StemmerId();
const input = ['apa', 'yang', 'dikembangkan', 'perusahaan', 'Anda'];
console.log(stemmer.stem(input));
// outuput: [ 'apa', 'yang', 'kembang', 'usaha', 'Anda' ]
