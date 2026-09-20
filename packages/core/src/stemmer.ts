import { defaultContainer } from './container.js';

class Stemmer {
  declare container: any;
  declare name: any;

  constructor(container = defaultContainer) {
    this.container = container.container || container;
    this.name = 'stem';
  }

  stem(tokens) {
    return tokens;
  }

  getStemmer(srcInput?) {
    const input = srcInput;
    const locale =
      input.locale || (input.settings ? input.settings.locale || 'en' : 'en');
    let stemmer = this.container.get(`stemmer-${locale}`);
    if (!stemmer) {
      const stemmerBert = this.container.get(`stemmer-bert`);
      if (stemmerBert && stemmerBert.activeFor(locale)) {
        stemmer = stemmerBert;
      } else {
        stemmer = this;
      }
    }
    return stemmer;
  }

  async addForTraining(srcInput) {
    const stemmer = this.getStemmer(srcInput);
    if (stemmer.addUtterance) {
      await stemmer.addUtterance(srcInput.utterance, srcInput.intent);
    }
    return srcInput;
  }

  async train(srcInput?) {
    const stemmer = this.getStemmer(srcInput);
    if (stemmer.innerTrain) {
      await stemmer.innerTrain();
    }
    return srcInput;
  }

  async run(srcInput) {
    const input = srcInput;
    const stemmer = this.getStemmer(input);
    input.tokens = await stemmer.stem(input.tokens, input);
    return input;
  }
}

export default Stemmer;
