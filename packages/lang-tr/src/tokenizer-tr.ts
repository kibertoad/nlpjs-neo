import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerTr extends Tokenizer {
  constructor(container?, shouldTokenize?) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-tr';
  }
}

export default TokenizerTr;
