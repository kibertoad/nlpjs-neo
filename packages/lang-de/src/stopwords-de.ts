import { Stopwords } from '@nlpjs-neo/core';

class StopwordsDe extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-de';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsDe;
