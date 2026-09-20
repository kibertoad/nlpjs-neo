import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerSl extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-sl';
  }
}

export default TokenizerSl;
