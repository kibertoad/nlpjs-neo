import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerEs extends Tokenizer {
  constructor(container?, shouldNormalize?) {
    super(container, shouldNormalize);
    this.name = 'tokenizer-es';
  }

  innerTokenize(text, _normalize?) {
    return text.split(/[\s,.!?;:([\]'"¡¿)/]+/).filter((x) => x);
  }
}

export default TokenizerEs;
