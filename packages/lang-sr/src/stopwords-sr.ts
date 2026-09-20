import { Stopwords } from '@nlpjs-neo/core';

class StopwordsSr extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-sr';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsSr;
