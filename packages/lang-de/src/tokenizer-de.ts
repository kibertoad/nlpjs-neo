import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerDe extends Tokenizer {
  constructor(container, shouldNormalize) {
    super(container, shouldNormalize);
    this.name = 'tokenizer-de';
  }
}

export default TokenizerDe;
