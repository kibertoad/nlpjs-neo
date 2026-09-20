import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerFr extends Tokenizer {
  constructor(container?, shouldTokenize?) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-fr';
  }

  innerTokenize(text, _normalize?) {
    const replaced = text.replace(/’/gi, "'");
    const slices = replaced.split(/[\s,.!?;:([\]’'"¡¿)/]+/).filter((x) => x);
    return slices;
  }
}

export default TokenizerFr;
