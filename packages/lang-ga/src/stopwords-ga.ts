import { Stopwords } from '@nlpjs-neo/core';

class StopwordsGa extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-ga';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsGa;
