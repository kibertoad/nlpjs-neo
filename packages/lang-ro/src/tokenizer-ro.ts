import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerRo extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-ro';
  }
}

export default TokenizerRo;
