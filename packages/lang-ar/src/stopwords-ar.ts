import { Stopwords } from '@nlpjs-neo/core';

class StopwordsAr extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-ar';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsAr;
