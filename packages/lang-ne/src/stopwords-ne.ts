import { Stopwords } from '@nlpjs-neo/core';

class StopwordsNe extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-ne';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsNe;
