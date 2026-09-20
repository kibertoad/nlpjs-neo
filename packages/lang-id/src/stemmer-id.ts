import { BaseStemmer } from '@nlpjs-neo/core';
import IndonesianStemmer from './indonesian-stemmer.js';

class StemmerId extends BaseStemmer {
  declare innerStemmer: any;

  constructor(container?) {
    super(container);
    this.name = 'stemmer-id';
    this.innerStemmer = new IndonesianStemmer();
  }

  innerStem() {
    this.setCurrent(this.innerStemmer.stemWord(this.getCurrent()));
  }
}

export default StemmerId;
