import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerPt extends Tokenizer {
  constructor(container?, shouldTokenize?) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-pt';
  }

  innerTokenize(text, _normalize?) {
    return text
      .split(/[\s,.!?;:([\]'"¡¿)/]+|[-'](?=[a-zA-Z])/)
      .filter((x) => x);
  }
}

export default TokenizerPt;
