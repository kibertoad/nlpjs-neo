import { Tokenizer } from '@nlpjs-neo/core';
import dictionary from './dictionary.js';

class TokenizerZh extends Tokenizer {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-zh';
  }

  innerTokenize(text, _normalize?) {
    return dictionary.segment(text);
  }
}

export default TokenizerZh;
