import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerNe extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-ne';
  }
}

export default TokenizerNe;
