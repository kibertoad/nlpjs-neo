import { Stopwords } from '@nlpjs-neo/core';

class StopwordsCa extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-ca';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsCa;
