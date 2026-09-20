import { defaultContainer } from './container.js';

class Stopwords {
  declare container: any;
  declare dictionary: any;
  declare name: any;

  constructor(container: any = defaultContainer) {
    this.container = container.container || container;
    this.name = 'removeStopwords';
    this.dictionary = {};
  }

  build(list) {
    for (let i = 0; i < list.length; i += 1) {
      this.dictionary[list[i]] = true;
    }
  }

  isNotStopword(token) {
    return !this.dictionary[token];
  }

  isStopword(token) {
    return !!this.dictionary[token];
  }

  removeStopwords(tokens) {
    return tokens.filter((x) => this.isNotStopword(x));
  }

  run(srcInput) {
    if (srcInput.settings && srcInput.settings.keepStopwords === false) {
      const input = srcInput;
      const locale = input.locale || 'en';
      const remover = this.container.get(`stopwords-${locale}`) || this;
      input.tokens = remover
        .removeStopwords(input.tokens, input)
        .filter((x) => x);
      return input;
    }
    return srcInput;
  }
}

export default Stopwords;
