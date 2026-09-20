import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerPl extends Tokenizer {
  constructor(container?, shouldNormalize?) {
    super(container, shouldNormalize);
    this.name = 'tokenizer-pl';
  }

  innerTokenize(text, _normalize?) {
    return text.split(/[\s,.!?;:([\]'"¡¿)/]+/).filter((x) => x);
  }
}

export default TokenizerPl;
