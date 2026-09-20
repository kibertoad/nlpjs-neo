import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerHu extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-hu';
  }
}

export default TokenizerHu;
