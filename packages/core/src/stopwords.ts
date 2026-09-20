import { defaultContainer, type Container } from './container.js';
import type {
  ContainerHolder,
  PipelineInput,
  StopwordDictionary,
  StopwordsService,
  Token,
} from './types.js';

class Stopwords implements StopwordsService {
  declare container: Container;
  declare dictionary: StopwordDictionary;
  declare name: string;

  constructor(container: ContainerHolder = defaultContainer) {
    this.container = container.container || (container as Container);
    this.name = 'removeStopwords';
    this.dictionary = {};
  }

  build(list: Token[]): void {
    for (let i = 0; i < list.length; i += 1) {
      this.dictionary[list[i]] = true;
    }
  }

  isNotStopword(token: Token): boolean {
    return !this.dictionary[token];
  }

  isStopword(token: Token): boolean {
    return !!this.dictionary[token];
  }

  removeStopwords(tokens: Token[]): Token[] {
    return tokens.filter((x) => this.isNotStopword(x));
  }

  run(srcInput: PipelineInput): PipelineInput {
    if (srcInput.settings && srcInput.settings.keepStopwords === false) {
      const input = srcInput;
      const locale = input.locale || 'en';
      const remover =
        this.container.get<StopwordsService>(`stopwords-${locale}`) || this;
      input.tokens = remover
        .removeStopwords(input.tokens as Token[], input)
        .filter((x) => x);
      return input;
    }
    return srcInput;
  }
}

export default Stopwords;
