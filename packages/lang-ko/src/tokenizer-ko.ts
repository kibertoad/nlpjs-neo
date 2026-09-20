import { Tokenizer } from '@nlpjs-neo/core';
import { tokenize } from './korean-tokenizer.js';

class TokenizerKo extends Tokenizer {
  constructor(container?, shouldTokenize?) {
    super(container, shouldTokenize);
    this.name = 'tokenizer-ko';
  }

  isHangulChar(ch) {
    const regex =
      /[\u1100-\u11FF\u302E\u302F\u3131-\u318E\u3200-\u321E\u3260-\u327E\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/g;
    return regex.test(ch);
  }

  clean(text) {
    const tokens = text.split(/[\s,.!?;:([\]'"¡¿)/]+/).filter((x) => x);
    const result: any[] = [];
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      let word = token[0];
      let isHangul = this.isHangulChar(word);
      for (let j = 1; j < token.length; j += 1) {
        const char = token[j];
        const newIsHangul = this.isHangulChar(char);
        if (newIsHangul !== isHangul) {
          result.push(word);
          word = char;
          isHangul = newIsHangul;
        } else {
          word += char;
        }
      }
      result.push(word);
    }
    return result.join(' ');
  }

  innerTokenize(text, _normalize?) {
    const tokens = tokenize(this.clean(text));
    const trimmed = tokens.map((x) => x.trim());
    const filtered = trimmed.filter((x) => x);
    return filtered;
  }
}

export default TokenizerKo;
