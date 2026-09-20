import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerSv extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-sv';
  }
}

export default TokenizerSv;
