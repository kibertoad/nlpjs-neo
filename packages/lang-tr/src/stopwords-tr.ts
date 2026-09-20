import { Stopwords } from '@nlpjs-neo/core';

class StopwordsTr extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-tr';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsTr;
