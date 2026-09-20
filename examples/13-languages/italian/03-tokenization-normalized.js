import { TokenizerIt } from '../../../packages/lang-it/src/index.js';
// import { TokenizerIt } from '@nlpjs-neo/lang-it';

const tokenizer = new TokenizerIt();
const input = 'Questo dovrebbe essere tokenizzato';
const result = tokenizer.tokenize(input, true);
console.log(result);
// output: [ 'questo', 'dovrebbe', 'essere', 'tokenizzato' ]
