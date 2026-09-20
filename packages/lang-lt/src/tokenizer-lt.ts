import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerLt extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-lt';
  }
}

export default TokenizerLt;
