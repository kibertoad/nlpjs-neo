import { BaseStemmer } from '@nlpjs-neo/core';

class StemmerFa extends BaseStemmer {
  constructor(container) {
    super(container);
    this.name = 'stemmer-fa';
  }

  innerStem() {
    // empty
  }
}

export default StemmerFa;
