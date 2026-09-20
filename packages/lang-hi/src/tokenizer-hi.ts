import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerHi extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-hi';
  }
}

export default TokenizerHi;
