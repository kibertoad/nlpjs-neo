import { Stopwords } from '@nlpjs-neo/core';

class StopwordsPl extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-pl';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsPl;
