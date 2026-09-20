import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerGa extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-ga';
  }
}

export default TokenizerGa;
