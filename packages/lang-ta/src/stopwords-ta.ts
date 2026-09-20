import { Stopwords } from '@nlpjs-neo/core';

class StopwordsTa extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-ta';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsTa;
