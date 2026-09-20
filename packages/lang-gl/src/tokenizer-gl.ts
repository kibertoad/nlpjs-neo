import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerGl extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-gl';
  }
}

export default TokenizerGl;
