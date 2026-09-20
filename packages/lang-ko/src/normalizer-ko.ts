import { Normalizer } from '@nlpjs-neo/core';

class NormalizerKo extends Normalizer {
  constructor(container?) {
    super(container);
    this.name = 'normalizer-ko';
  }

  normalize(text, _input?) {
    return text.replace(/까?/g, '').toLowerCase();
  }

  run(srcInput) {
    const input = srcInput;
    input.text = this.normalize(input.text, input);
    return input;
  }
}

export default NormalizerKo;
