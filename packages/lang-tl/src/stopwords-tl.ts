import { Stopwords } from '@nlpjs-neo/core';

class StopwordsTl extends Stopwords {
  constructor(container, words) {
    super(container);
    this.name = 'stopwords-tl';
    this.dictionary = {};
    const list = words || [];
    this.build(list);
  }
}

export default StopwordsTl;
