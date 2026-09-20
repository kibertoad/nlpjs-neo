import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerTl extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-tl';
  }
}

export default TokenizerTl;
