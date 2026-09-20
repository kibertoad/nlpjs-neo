import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerRu extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-ru';
  }
}

export default TokenizerRu;
