import Lookup from './lookup.js';
import type {
  Corpus,
  Feature,
  FeatureMap,
  Intent,
  PreparedEntry,
  SparseVector,
} from './types.js';

/** The feature and intent lookups of a corpus, kept together. */
class CorpusLookup {
  declare inputLookup: Lookup;
  declare numInputs: number;
  declare numOutputs: number;
  declare outputLookup: Lookup;

  constructor(features?: Feature[], intents?: Intent[]) {
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

  /** Builds the lookups from a corpus and returns it in vector form. */
  build(corpus: Corpus): PreparedEntry[] {
    this.inputLookup = new Lookup(corpus, 'input');
    this.outputLookup = new Lookup(corpus, 'output');
    this.numInputs = this.inputLookup.items.length;
    this.numOutputs = this.outputLookup.items.length;
    const result: PreparedEntry[] = [];
    for (let i = 0; i < corpus.length; i += 1) {
      const { input, output } = corpus[i];
      result.push({
        input: this.inputLookup.prepare(input),
        output: this.outputLookup.prepare(output),
      });
    }
    return result;
  }

  transformInput(input: FeatureMap): SparseVector {
    return this.inputLookup.prepare(input);
  }
}

export default CorpusLookup;
