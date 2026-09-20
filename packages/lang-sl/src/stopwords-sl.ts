import { Stopwords } from '@nlpjs-neo/core';

class StopwordsSl extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-sl';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsSl;
