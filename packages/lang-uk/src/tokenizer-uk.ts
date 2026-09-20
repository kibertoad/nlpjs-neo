import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerUk extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-uk';
  }
}

export default TokenizerUk;
