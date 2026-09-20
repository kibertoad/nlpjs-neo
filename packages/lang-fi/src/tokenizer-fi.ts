import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerFi extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-fi';
  }
}

export default TokenizerFi;
