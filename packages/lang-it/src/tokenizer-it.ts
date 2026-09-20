import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerIt extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-it';
  }
}

export default TokenizerIt;
