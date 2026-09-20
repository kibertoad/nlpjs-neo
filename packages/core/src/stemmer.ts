import { defaultContainer, type Container } from './container.js';
import type {
  ContainerHolder,
  Locale,
  PipelineInput,
  StemmerService,
  Token,
} from './types.js';

/**
 * A stemmer resolved from the container. Language stemmers add their own
 * training hooks on top of the `stem` contract.
 */
interface ResolvedStemmer extends StemmerService {
  addUtterance?(utterance: string, intent: string): unknown;
  innerTrain?(): unknown;
}

/**
 * A stemmer that covers several locales at once and says which. The BERT
 * stemmer is the one this fork ships.
 */
interface MultiLocaleStemmer extends ResolvedStemmer {
  activeFor(locale: Locale): boolean;
}

class Stemmer implements StemmerService {
  declare container: Container;
  declare name: string;

  constructor(container: ContainerHolder = defaultContainer) {
    this.container = container.container || (container as Container);
    this.name = 'stem';
  }

  stem(tokens: Token[]): Token[] {
    return tokens;
  }

  getStemmer(srcInput?: PipelineInput): ResolvedStemmer {
    const input = srcInput;
    const locale =
      input.locale || (input.settings ? input.settings.locale || 'en' : 'en');
    let stemmer = this.container.get<ResolvedStemmer>(`stemmer-${locale}`);
    if (!stemmer) {
      const stemmerBert =
        this.container.get<MultiLocaleStemmer>(`stemmer-bert`);
      if (stemmerBert && stemmerBert.activeFor(locale)) {
        stemmer = stemmerBert;
      } else {
        // No stemmer for this locale, so this one -- which answers the tokens
        // unchanged -- is the fallback.
        // oxlint-disable-next-line typescript/no-this-alias
        stemmer = this;
      }
    }
    return stemmer;
  }

  async addForTraining(srcInput: PipelineInput): Promise<PipelineInput> {
    const stemmer = this.getStemmer(srcInput);
    if (stemmer.addUtterance) {
      await stemmer.addUtterance(srcInput.utterance, srcInput.intent);
    }
    return srcInput;
  }

  async train(srcInput?: PipelineInput): Promise<PipelineInput | undefined> {
    const stemmer = this.getStemmer(srcInput);
    if (stemmer.innerTrain) {
      await stemmer.innerTrain();
    }
    return srcInput;
  }

  async run(srcInput: PipelineInput): Promise<PipelineInput> {
    const input = srcInput;
    const stemmer = this.getStemmer(input);
    input.tokens = await stemmer.stem(input.tokens as Token[], input);
    return input;
  }
}

export default Stemmer;
