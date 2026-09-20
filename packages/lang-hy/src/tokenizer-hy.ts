import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerHy extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-hy';
  }
}

export default TokenizerHy;
