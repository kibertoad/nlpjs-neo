import { Normalizer } from '@nlpjs-neo/core';

class NormalizerEn extends Normalizer {
  constructor(container?) {
    super(container);
    this.name = 'normalizer-en';
  }

  normalize(text, _input?) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  run(srcInput) {
    const input = srcInput;
    input.text = this.normalize(input.text, input);
    return input;
  }
}

export default NormalizerEn;
