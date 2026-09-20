import { Stopwords } from '@nlpjs-neo/core';

class StopwordsHy extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-hy';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsHy;
