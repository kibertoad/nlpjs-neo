import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerNo extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-no';
  }
}

export default TokenizerNo;
