import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerDa extends Tokenizer {
  constructor(container, shouldNormalize) {
    super(container, shouldNormalize);
    this.name = 'tokenizer-da';
  }
}

export default TokenizerDa;
