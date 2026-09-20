import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerTa extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-ta';
  }
}

export default TokenizerTa;
