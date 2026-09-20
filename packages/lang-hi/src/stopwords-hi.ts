import { Stopwords } from '@nlpjs-neo/core';

class StopwordsHi extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-hi';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsHi;
