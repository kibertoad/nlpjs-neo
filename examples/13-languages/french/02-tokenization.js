import { TokenizerFr } from '../../../packages/lang-fr/src/index.js';

const tokenizer = new TokenizerFr();
const input = "Ceci n'est pas encore tokenisé";
const result = tokenizer.tokenize(input);
console.log(result);
// output: [ 'Ceci', 'n', 'est', 'pas', 'encore', 'tokenisé']
