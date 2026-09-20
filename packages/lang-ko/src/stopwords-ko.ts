import { Stopwords } from '@nlpjs-neo/core';

class StopwordsKo extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-ko';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsKo;
