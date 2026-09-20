import { defaultContainer } from './container.js';
import Normalizer from './normalizer.js';

class Tokenizer {
  declare cache: any;
  declare container: any;
  declare name: any;
  declare normalizer: any;
  declare shouldNormalize: any;

  constructor(container = defaultContainer, shouldNormalize = false) {
    this.container = container.container || container;

    this.name = 'tokenize';
    this.shouldNormalize = shouldNormalize;
  }

  getNormalizer() {
    if (!this.normalizer) {
      this.normalizer =
        this.container.get(`normalizer-${this.name.slice(-2)}`) ||
        new Normalizer();
    }
    return this.normalizer;
  }

  normalize(text, force) {
    if ((force === undefined && this.shouldNormalize) || force === true) {
      const normalizer = this.getNormalizer();
      return normalizer.normalize(text);
    }
    return text;
  }

  innerTokenize(text, _normalize?) {
    return text.split(/[\s,.!?;:([\]'"¡¿)/]+/).filter((x) => x);
  }

  tokenize(text, normalize?) {
    let result;
    if (this.cache) {
      const now = new Date();
      const diff = Math.abs(now.getTime() - this.cache.created) / 3600000;
      if (diff > 1) {
        this.cache = undefined;
      }
    }
    if (!this.cache) {
      this.cache = {
        created: new Date().getTime(),
        normalized: {},
        nonNormalized: {},
      };
    } else {
      if (normalize) {
        if (Object.prototype.hasOwnProperty.call(this.cache.normalized, text)) {
          result = this.cache.normalized[text];
        }
      } else if (
        Object.prototype.hasOwnProperty.call(this.cache.nonNormalized, text)
      ) {
        result = this.cache.nonNormalized[text];
      }
      if (result) {
        return result;
      }
    }
    result = this.innerTokenize(this.normalize(text, normalize), normalize);
    if (normalize) {
      this.cache.normalized[text] = result;
    } else {
      this.cache.nonNormalized[text] = result;
    }
    return result;
  }

  async run(srcInput) {
    const input = srcInput;
    const locale = input.locale || 'en';
    let tokenizer = this.container.get(`tokenizer-${locale}`);
    if (!tokenizer) {
      const tokenizerBert = this.container.get(`tokenizer-bert`);
      if (tokenizerBert && tokenizerBert.activeFor(locale)) {
        tokenizer = tokenizerBert;
      } else {
        tokenizer = this;
      }
    }
    const tokens = await tokenizer.tokenize(input.text, input);
    input.tokens = tokens.filter((x) => x);
    return input;
  }
}

export default Tokenizer;
