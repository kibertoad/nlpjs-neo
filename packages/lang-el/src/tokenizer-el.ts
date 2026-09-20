import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerEl extends Tokenizer {
  constructor(container, shouldNormalize) {
    super(container, shouldNormalize);
    this.name = 'tokenizer-el';
  }
}

export default TokenizerEl;
