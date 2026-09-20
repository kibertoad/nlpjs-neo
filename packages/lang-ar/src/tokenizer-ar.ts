import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerAr extends Tokenizer {
  constructor(container, shouldNormalize) {
    super(container, shouldNormalize);
    this.name = 'tokenizer-ar';
  }
}

export default TokenizerAr;
