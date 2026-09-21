import SnowballStemmerEn from './stemmer-en.generated.js';
import TokenizerEn from './tokenizer-en.js';

/**
 * The English stemmer. The algorithm is the Snowball one, generated from
 * `tools/snowball/algorithms/english.sbl` into `stemmer-en.generated.ts`;
 * what this class adds is the tokenizer of the language, which expands the
 * contractions before the words are stemmed.
 */
class StemmerEn extends SnowballStemmerEn {
  getTokenizer() {
    if (!this.tokenizer) {
      this.tokenizer =
        this.container.get(`tokenizer-${this.name.slice(-2)}`) ||
        new TokenizerEn();
      if (this.tokenizer.constructor.name === 'Tokenizer') {
        this.tokenizer = new TokenizerEn();
      }
    }
    return this.tokenizer;
  }
}

export default StemmerEn;
