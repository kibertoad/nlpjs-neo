import { Stopwords } from '@nlpjs-neo/core';

class StopwordsLt extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-lt';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsLt;
