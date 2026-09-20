import { Normalizer } from '@nlpjs-neo/core';

class NormalizerBn extends Normalizer {
  constructor(container?) {
    super(container);
    this.name = 'normalizer-bn';
  }

  normalize(text, _input?) {
    let result = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    result = result.replace('\u200D', '');
    result = result.replace('\u09CD', '');
    result = result.replace('\u09BC', '');
    result = result.replace('\u09DC', '\u09A1');
    result = result.replace('\u09DD', '\u09A2');
    result = result.replace('\u09DF', '\u09AF');
    result = result.replace('\u09C7\u09BE', '\u09CB');
    result = result.replace('\u09C7\u09D7', '\u09CC');
    result = result.replace('\u09C0', '\u09BF');
    result = result.replace('\u09C2', '\u09C1');
    return result.replace(/^[^\u0980-\u09FF]+|[^\u0980-\u09FF]+$/g, '');
  }

  run(srcInput) {
    const input = srcInput;
    input.text = this.normalize(input.text, input);
    return input;
  }
}

export default NormalizerBn;
