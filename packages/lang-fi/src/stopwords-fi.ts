import { Stopwords } from '@nlpjs-neo/core';

class StopwordsFi extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-fi';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsFi;
