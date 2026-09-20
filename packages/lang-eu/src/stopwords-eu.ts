import { Stopwords } from '@nlpjs-neo/core';

class StopwordsEu extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-eu';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsEu;
