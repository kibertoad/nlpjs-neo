import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerNl extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-nl';
  }
}

export default TokenizerNl;
