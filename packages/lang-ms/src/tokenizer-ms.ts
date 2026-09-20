import { TokenizerId } from '@nlpjs-neo/lang-id';

class TokenizerMs extends TokenizerId {
  constructor(container, shouldTokenize) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-ms';
  }
}

export default TokenizerMs;
