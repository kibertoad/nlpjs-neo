import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerCa extends Tokenizer {
  constructor(container, shouldNormalize) {
    super(container, shouldNormalize);
    this.name = 'tokenizer-ca';
  }
}

export default TokenizerCa;
