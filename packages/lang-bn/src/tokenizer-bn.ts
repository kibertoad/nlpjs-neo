import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerBn extends Tokenizer {
  constructor(container?, shouldNormalize?) {
    super(container, shouldNormalize);
    this.name = 'tokenizer-bn';
  }

  innerTokenize(text, _normalize?) {
    return text.split(/[\s,.!?;:([\]'"¡¿।-]+/).filter((x) => x);
  }
}

export default TokenizerBn;
