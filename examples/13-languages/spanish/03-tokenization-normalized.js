import { TokenizerEs } from '../../../packages/lang-es/src/index.js';
// import { TokenizerEs } from '@nlpjs-neo/lang-es';

const tokenizer = new TokenizerEs();
const input = 'Esto debería ser tokenizado';
const result = tokenizer.tokenize(input, true);
console.log(result);
// output: [ 'esto', 'deberia', 'ser', 'tokenizado' ]
