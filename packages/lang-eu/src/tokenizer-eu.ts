import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerEu extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-eu';
  }
}

export default TokenizerEu;
