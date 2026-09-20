import { defaultContainer, type Container } from './container.js';
import Normalizer from './normalizer.js';
import type {
  ContainerHolder,
  NormalizeFlag,
  NormalizerService,
  PipelineInput,
  Token,
  TokenizerService,
} from './types.js';

/**
 * Tokenizations already computed, kept for an hour and separated by whether
 * the text was normalized first.
 */
interface TokenizerCache {
  created: number;
  normalized: Record<string, Token[]>;
  nonNormalized: Record<string, Token[]>;
}

/** The BERT tokenizer additionally reports the locales it can handle. */
interface BertTokenizer extends TokenizerService {
  activeFor(locale: string): boolean;
}

class Tokenizer implements TokenizerService {
  declare cache: TokenizerCache | undefined;
  declare container: Container;
  declare name: string;
  declare normalizer: NormalizerService | undefined;
  declare shouldNormalize: boolean;

  constructor(
    container: ContainerHolder = defaultContainer,
    shouldNormalize = false
  ) {
    this.container = container.container || (container as Container);

    this.name = 'tokenize';
    this.shouldNormalize = shouldNormalize;
  }

  getNormalizer(): NormalizerService {
    if (!this.normalizer) {
      this.normalizer =
        this.container.get<NormalizerService>(
          `normalizer-${this.name.slice(-2)}`
        ) || new Normalizer();
    }
    return this.normalizer;
  }

  normalize(text: string, force?: NormalizeFlag): string {
    if ((force === undefined && this.shouldNormalize) || force === true) {
      const normalizer = this.getNormalizer();
      return normalizer.normalize(text);
    }
    return text;
  }

  innerTokenize(text: string, _normalize?: NormalizeFlag): Token[] {
    return text.split(/[\s,.!?;:([\]'"¡¿)/]+/).filter((x) => x);
  }

  tokenize(text: string, normalize?: NormalizeFlag): Token[] {
    let result: Token[] | undefined;
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

  async run(srcInput: PipelineInput): Promise<PipelineInput> {
    const input = srcInput;
    const locale = input.locale || 'en';
    let tokenizer = this.container.get<TokenizerService>(`tokenizer-${locale}`);
    if (!tokenizer) {
      const tokenizerBert = this.container.get<BertTokenizer>(`tokenizer-bert`);
      if (tokenizerBert && tokenizerBert.activeFor(locale)) {
        tokenizer = tokenizerBert;
      } else {
        tokenizer = this;
      }
    }
    const tokens = await tokenizer.tokenize(input.text as string, input);
    input.tokens = tokens.filter((x) => x);
    return input;
  }
}

export default Tokenizer;
