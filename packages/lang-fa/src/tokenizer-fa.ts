import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerFa extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-fa';
  }
}

export default TokenizerFa;
