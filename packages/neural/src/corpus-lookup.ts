import Lookup from './lookup.js';

class CorpusLookup {
  declare inputLookup: any;
  declare numInputs: any;
  declare numOutputs: any;
  declare outputLookup: any;

  constructor(features?, intents?) {
    if (features) {
      this.inputLookup = new Lookup();
      this.outputLookup = new Lookup();
      for (let i = 0; i < features.length; i += 1) {
        this.inputLookup.add(features[i]);
      }
      for (let i = 0; i < intents.length; i += 1) {
        this.outputLookup.add(intents[i]);
      }
      this.numInputs = this.inputLookup.items.length;
      this.numOutputs = this.outputLookup.items.length;
    }
  }

  build(corpus) {
    this.inputLookup = new Lookup(corpus, 'input');
    this.outputLookup = new Lookup(corpus, 'output');
    this.numInputs = this.inputLookup.items.length;
    this.numOutputs = this.outputLookup.items.length;
    const result: any[] = [];
    for (let i = 0; i < corpus.length; i += 1) {
      const { input, output } = corpus[i];
      result.push({
        input: this.inputLookup.prepare(input),
        output: this.outputLookup.prepare(output),
      });
    }
    return result;
  }

  transformInput(input) {
    return this.inputLookup.prepare(input);
  }
}

export default CorpusLookup;
