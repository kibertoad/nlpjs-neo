import { Normalizer } from '@nlpjs-neo/core';
import { converters, fixCompositeSymbols } from './helper.js';

class NormalizerJa extends Normalizer {
  constructor(container?) {
    super(container);
    this.name = 'normalizer-ja';
  }

  normalize(text, _input?) {
    let str = text.replace(/(..)々々/g, '$1$1').replace(/(.)々/g, '$1$1');
    str = converters.normalize(str);
    str = converters.fixFullwidthKana(str);
    str = fixCompositeSymbols(str);
    return str;
  }

  run(srcInput) {
    const input = srcInput;
    input.text = this.normalize(input.text, input);
    return input;
  }
}

export default NormalizerJa;
