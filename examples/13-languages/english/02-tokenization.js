import { TokenizerEn } from '../../../packages/lang-en/src/index.js';
// import { TokenizerEn } from '@nlpjs-neo/lang-en';

const tokenizer = new TokenizerEn();
const input = "This isn't tokenized yet";
const result = tokenizer.tokenize(input);
console.log(result);
// output: [ 'This', 'is', 'not', 'tokenized', 'yet' ]
