/** A token, as produced by a tokenizer. */
type Token = string;

/** Tokens mapped to how often they appear in an input. */
type TermFreqMap = Record<Token, number>;

/** Tokens of both inputs, `true` for every term seen in either of them. */
type TermDictionary = Record<Token, boolean>;

/** Tokenizer resolved from the container for the locale being compared. */
interface Tokenizer {
  tokenize(text: string, normalize?: boolean): Token[];
}

/**
 * Minimal view of a container: cosine similarity only resolves the tokenizer
 * of a locale from it.
 */
interface TokenizerResolver {
  get(name: string): Tokenizer | undefined;
}

/** Term frequencies of two inputs, aligned on the same term dictionary. */
type TermFreqVectors = [left: number[], right: number[]];

class CosineSimilarity {
  declare container: TokenizerResolver | undefined;

  constructor(container?: TokenizerResolver) {
    this.container = container;
  }

  getTokens(text: string | Token[], locale = 'en'): Token[] {
    if (typeof text === 'string') {
      const tokenizer =
        this.container && this.container.get(`tokenizer-${locale}`);
      return tokenizer ? tokenizer.tokenize(text, true) : text.split(' ');
    }
    return text;
  }

  termFreqMap(str: string | Token[], locale?: string): TermFreqMap {
    const words = this.getTokens(str, locale);
    const termFreq: TermFreqMap = {};
    words.forEach((w) => {
      termFreq[w] = (termFreq[w] || 0) + 1;
    });
    return termFreq;
  }

  addKeysToDict(map: TermFreqMap, dict: TermDictionary): void {
    Object.keys(map).forEach((key) => {
      dict[key] = true;
    });
  }

  termFreqMapToVector(map: TermFreqMap, dict: TermDictionary): number[] {
    const termFreqVector: number[] = [];
    Object.keys(dict).forEach((term) => {
      termFreqVector.push(map[term] || 0);
    });
    return termFreqVector;
  }

  vecDotProduct(vecA: number[], vecB: number[]): number {
    let product = 0;
    for (let i = 0; i < vecA.length; i += 1) {
      product += vecA[i] * vecB[i];
    }
    return product;
  }

  vecMagnitude(vec: number[]): number {
    let sum = 0;
    for (let i = 0; i < vec.length; i += 1) {
      sum += vec[i] * vec[i];
    }
    return Math.sqrt(sum);
  }

  /**
   * Calculates cosine-similarity from two vectors
   * @param left Left vector
   * @param right Right vector
   * @returns cosine between two vectors
   * {@link https://en.wikipedia.org/wiki/Cosine_similarity Cosine Similarity}
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    return (
      this.vecDotProduct(vecA, vecB) /
      (this.vecMagnitude(vecA) * this.vecMagnitude(vecB))
    );
  }

  // Returns either a pair of frequency vectors or `0` when one of the
  // inputs has no terms left after normalisation.
  getTermFreqVectors(
    strA: string | Token[],
    strB: string | Token[],
    locale?: string
  ): TermFreqVectors | 0 {
    const termFreqA = this.termFreqMap(strA, locale);
    const termFreqB = this.termFreqMap(strB, locale);

    if (!Object.keys(termFreqA).length || !Object.keys(termFreqB).length) {
      return 0;
    }
    const dict: TermDictionary = {};
    this.addKeysToDict(termFreqA, dict);
    this.addKeysToDict(termFreqB, dict);

    return [
      this.termFreqMapToVector(termFreqA, dict),
      this.termFreqMapToVector(termFreqB, dict),
    ];
  }

  /**
   * Calculates cosine-similarity from two sentences
   * @param strA Left string
   * @param strB Right string
   * @returns cosine between two sentences represented in VSM
   */
  similarity(
    strA: string | Token[],
    strB: string | Token[],
    locale?: string
  ): number {
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
