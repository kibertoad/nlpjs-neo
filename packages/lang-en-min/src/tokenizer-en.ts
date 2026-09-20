import { Tokenizer } from '@nlpjs-neo/core';

class TokenizerEn extends Tokenizer {
  constructor(container?, shouldNormalize?) {
    super(container, shouldNormalize);
    this.name = 'tokenizer-en';
  }

  replace(text) {
    let result = text.replace(/n't([ ,:;.!?]|$)/gi, ' not ');
    result = result.replace(/can't([ ,:;.!?]|$)/gi, 'can not ');
    result = result.replace(/'ll([ ,:;.!?]|$)/gi, ' will ');
    result = result.replace(/'s([ ,:;.!?]|$)/gi, ' is ');
    result = result.replace(/'re([ ,:;.!?]|$)/gi, ' are ');
    result = result.replace(/'ve([ ,:;.!?]|$)/gi, ' have ');
    result = result.replace(/'m([ ,:;.!?]|$)/gi, ' am ');
    result = result.replace(/'d([ ,:;.!?]|$)/gi, ' had ');
    return result;
  }

  /** Splits the contractions a tokenizer would otherwise keep as one word. */
  replaceContractions(arr: string[], _text?: string): string[] {
    const contractionsBase = {
      cannot: ['can', 'not'],
      gonna: ['going', 'to'],
      wanna: ['want', 'to'],
    };

    const result: string[] = [];
    arr.forEach((item) => {
      const lowitem = item.toLowerCase() as keyof typeof contractionsBase;
      if (Object.prototype.hasOwnProperty.call(contractionsBase, lowitem)) {
        result.push(...contractionsBase[lowitem]);
      } else {
        result.push(item);
      }
    });
    return result;
  }

  innerTokenize(text, _normalize?) {
    const replaced = this.replace(text);
    const arr = replaced.split(/[\s,.!?;:([\]'"¡¿)/]+/).filter((x) => x);
    return this.replaceContractions(arr, text);
  }
}

export default TokenizerEn;
