import { TokenizerId } from '../../../packages/lang-id/src/index.js';
// import { TokenizerId } from '@nlpjs-neo/lang-id';

const tokenizer = new TokenizerId();
const input = 'apa yang dikembangkan perusahaan Anda';
const result = tokenizer.tokenize(input);
console.log(result);
// output: [ 'apa', 'yang', 'dikembangkan', 'perusahaan', 'Anda' ]
