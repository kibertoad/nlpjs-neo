import { TokenizerFr } from '../../../packages/lang-fr/src/index.js';

const tokenizer = new TokenizerFr();
const input =
  "Voici une phrase qui n'est pas encore tokenisée et même pas normalisée";
const result = tokenizer.tokenize(input, true);
console.log(result);
// output: ['voici', 'une','phrase','qui','n','est','pas','encore','tokenisee','et','meme','pas','normalisee']
