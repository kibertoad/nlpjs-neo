import { TokenizerIt } from '../../../packages/lang-it/src/index.js';
// import { TokenizerIt } from '@nlpjs-neo/lang-it';

const tokenizer = new TokenizerIt();
const input = 'Questo dovrebbe essere tokenizzato';
const result = tokenizer.tokenize(input);
console.log(result);
// output: [ 'Questo', 'dovrebbe', 'essere', 'tokenizzato' ]
