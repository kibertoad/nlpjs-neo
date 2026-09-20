class CosineSimilarity {
  declare container: any;

  constructor(container?) {
    this.container = container;
  }

  getTokens(text, locale = 'en') {
    if (typeof text === 'string') {
      const tokenizer =
        this.container && this.container.get(`tokenizer-${locale}`);
      return tokenizer ? tokenizer.tokenize(text, true) : text.split(' ');
    }
    return text;
  }

  termFreqMap(str, locale?) {
    const words = this.getTokens(str, locale);
    const termFreq: any = {};
    words.forEach((w) => {
      termFreq[w] = (termFreq[w] || 0) + 1;
    });
    return termFreq;
  }

  addKeysToDict(map, dict) {
    Object.keys(map).forEach((key) => {
      dict[key] = true;
    });
  }

  termFreqMapToVector(map, dict) {
    const termFreqVector: any[] = [];
    Object.keys(dict).forEach((term) => {
      termFreqVector.push(map[term] || 0);
    });
    return termFreqVector;
  }

  vecDotProduct(vecA, vecB) {
    let product = 0;
    for (let i = 0; i < vecA.length; i += 1) {
      product += vecA[i] * vecB[i];
    }
    return product;
  }

  vecMagnitude(vec) {
    let sum = 0;
    for (let i = 0; i < vec.length; i += 1) {
      sum += vec[i] * vec[i];
    }
    return Math.sqrt(sum);
  }

  /**
   * Calculates cosine-similarity from two vectors
   * @param {number[]} left Left vector
   * @param {number[]} right Right vector
   * @returns {number} cosine between two vectors
   * {@link https://en.wikipedia.org/wiki/Cosine_similarity Cosine Similarity}
   */
  cosineSimilarity(vecA, vecB) {
    return (
      this.vecDotProduct(vecA, vecB) /
      (this.vecMagnitude(vecA) * this.vecMagnitude(vecB))
    );
  }

  // Returns either a pair of frequency vectors or `0` when one of the
  // inputs has no terms left after normalisation.
  getTermFreqVectors(strA, strB, locale): any {
    const termFreqA = this.termFreqMap(strA, locale);
    const termFreqB = this.termFreqMap(strB, locale);

    if (!Object.keys(termFreqA).length || !Object.keys(termFreqB).length) {
      return 0;
    }
    const dict: any = {};
    this.addKeysToDict(termFreqA, dict);
    this.addKeysToDict(termFreqB, dict);

    return [
      this.termFreqMapToVector(termFreqA, dict),
      this.termFreqMapToVector(termFreqB, dict),
    ];
  }

  /**
   * Calculates cosine-similarity from two sentences
   * @param {string} left Left string
   * @param {string} right Right string
   * @returns {number} cosine between two sentences representend in VSM
   */
  similarity(strA, strB, locale?) {
    if (strA === strB) {
      return 1;
    }

    const vectors = this.getTermFreqVectors(strA, strB, locale);
    if (vectors === 0) {
      return 0;
    }
    const [termFreqVecA, termFreqVecB] = vectors;
    return this.cosineSimilarity(termFreqVecA, termFreqVecB);
  }
}

export default CosineSimilarity;
