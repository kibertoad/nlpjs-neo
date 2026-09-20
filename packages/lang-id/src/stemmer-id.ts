import { BaseStemmer } from '@nlpjs-neo/core';
import IndonesianStemmer from './indonesian-stemmer.js';

import type { ContainerHolder, Token } from '@nlpjs-neo/core';

/**
 * The generated Snowball stemmer, which is written as a constructor function
 * rather than a class, so its one method is described here.
 */
interface InnerStemmer {
  stemWord(word: Token): Token;
}

class StemmerId extends BaseStemmer {
  /** The Snowball stemmer this delegates a word to. */
  declare innerStemmer: InnerStemmer;

  constructor(container?: ContainerHolder) {
    super(container);
    this.name = 'stemmer-id';
    this.innerStemmer = new IndonesianStemmer() as InnerStemmer;
  }

  innerStem(): void {
    this.setCurrent(this.innerStemmer.stemWord(this.getCurrent()));
  }
}

export default StemmerId;
