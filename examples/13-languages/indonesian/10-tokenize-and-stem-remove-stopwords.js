import { StemmerId, StopwordsId } from '../../../packages/lang-id/src/index.js';
// import { StemmerId, StopwordsId } from '@nlpjs-neo/lang-id';

const stemmer = new StemmerId();
stemmer.stopwords = new StopwordsId();
const input = 'apa yang dikembangkan perusahaan Anda';
console.log(stemmer.tokenizeAndStem(input, false));
// output: [ 'kembang', 'usaha' ]
