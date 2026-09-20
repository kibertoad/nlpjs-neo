import { BaseStemmer } from '@nlpjs-neo/core';

class StemmerTh extends BaseStemmer {
  constructor(container) {
    super(container);
    this.name = 'stemmer-th';
  }

  innerStem() {
    // do nothing
  }
}

export default StemmerTh;
