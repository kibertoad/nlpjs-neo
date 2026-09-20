import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerSr extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-sr';
  }
}

export default TokenizerSr;
