import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerCs extends Tokenizer {
  constructor(container, shouldNormalize) {
    super(container, shouldNormalize);
    this.name = 'tokenizer-cs';
  }
}

export default TokenizerCs;
