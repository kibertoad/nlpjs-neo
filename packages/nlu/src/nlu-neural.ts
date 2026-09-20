import { NeuralNetwork } from '@nlpjs-neo/neural';
import Nlu from './nlu.js';
import type { Corpus } from '@nlpjs-neo/neural';
import type {
  Classification,
  Intent,
  NluInput,
  NluJson,
  PreparedCorpusEntry,
} from './types.js';

class NeuralNlu extends Nlu {
  /** Built by `innerTrain`, or restored from an exported model. */
  declare neuralNetwork: NeuralNetwork | undefined;

  async innerTrain(srcInput: NluInput): Promise<NluInput> {
    const input = srcInput;
    this.neuralNetwork = new NeuralNetwork(input.settings, this.container);
    // The train pipeline runs `prepareCorpus` first, so by now the corpus
    // holds features rather than utterances.
    input.status = await this.neuralNetwork.train(
      input.corpus as PreparedCorpusEntry[] as Corpus
    );
    return input;
  }

  innerProcess(srcInput: NluInput): NluInput {
    const input = srcInput;
    input.classifications = this.neuralNetwork
      ? this.neuralNetwork.run(input.tokens as Record<string, number>) || {
          None: 1,
        }
      : { None: 1 };
    this.convertToArray(input);
    // `convertToArray` replaced the score per intent with a sorted answer.
    const { intent } = (
      input.classifications as unknown as Classification[]
    )[0];
    if (
      input.settings &&
      input.settings.returnExplanation &&
      intent &&
      this.neuralNetwork &&
      intent !== 'None'
    ) {
      input.explanation = this.neuralNetwork.explain(
        input.tokens as Record<string, number>,
        intent as Intent
      );
    }
    return input;
  }

  registerDefault(): void {
    super.registerDefault();
    this.container.register('NeuralNlu', NeuralNlu, false);
  }

  toJSON(): NluJson {
    const result = super.toJSON();
    result.neuralNetwork = this.neuralNetwork
      ? this.neuralNetwork.toJSON()
      : undefined;
    return result;
  }

  fromJSON(json: NluJson): void {
    super.fromJSON(json);
    if (json.neuralNetwork) {
      this.neuralNetwork = new NeuralNetwork();
      this.neuralNetwork.fromJSON(json.neuralNetwork);
    }
  }
}

export default NeuralNlu;
