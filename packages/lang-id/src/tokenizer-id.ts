import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerId extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-id';
  }
}

export default TokenizerId;
