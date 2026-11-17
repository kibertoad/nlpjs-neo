import CorpusLookup from './corpus-lookup.js';
import type {
  Corpus,
  Explanation,
  FeatureMap,
  Intent,
  IntentMap,
  NeuralNetworkJson,
  NeuralNetworkSettings,
  Perceptron,
  PreparedEntry,
  SparseVector,
  TrainLogger,
  TrainResult,
  TrainStatus,
} from './types.js';

/**
 * The rate an `'auto'` setting resolves to for a corpus of this many samples.
 *
 * The perceptrons learn one utterance at a time, so what one pass over the
 * corpus moves them grows with its size: one over the square root of the
 * number of samples is 0.06 for 250 utterances and 0.01 for 10,000. A fixed
 * rate that suits a small corpus never settles on a big one, and one that
 * suits a big corpus needs hundreds of passes on a small one.
 */
function autoLearningRate(numSamples: number): number {
  return 1 / Math.sqrt(numSamples);
}

const defaultSettings: NeuralNetworkSettings = {
  iterations: 20000,
  errorThresh: 0.00005,
  deltaErrorThresh: 0.00001,
  learningRate: 'auto',
  momentum: 0.9,
  alpha: 0.07,
  log: false,
};

class NeuralNetwork {
  /** Learning rate of the current iteration, decayed over time. */
  declare decayLearningRate: number;
  /**
   * Rate the settings pin, or the one `train` derived from the corpus for an
   * `'auto'` setting. It is `undefined` until a first training resolves it.
   */
  declare baseLearningRate: number | undefined;
  declare logFn: TrainLogger | undefined;
  declare lookup: CorpusLookup | undefined;
  declare numPerceptrons: number;
  /** Score of every intent for the last input that was run. */
  declare outputs: IntentMap;
  declare perceptrons: Perceptron[];
  declare perceptronsByName: Record<Intent, Perceptron>;
  declare settings: NeuralNetworkSettings;
  declare status: TrainStatus | undefined;

  constructor(settings: NeuralNetworkSettings = {}, _container?: unknown) {
    this.settings = settings;
    this.applySettings(this.settings, defaultSettings);
    if (this.settings.log === true) {
      this.logFn = (status: TrainStatus, time: number) =>
        console.log(
          `Epoch ${status.iterations} loss ${status.error} time ${time}ms`
        );
    } else if (typeof this.settings.log === 'function') {
      this.logFn = this.settings.log;
    }
  }

  /** Fills in every setting the object does not define itself. */
  applySettings<T extends NeuralNetworkSettings>(
    obj: T = {} as T,
    settings: NeuralNetworkSettings = {}
  ): T {
    Object.keys(settings).forEach((key) => {
      if (obj[key] === undefined) {
        (obj as NeuralNetworkSettings)[key] = settings[key];
      }
    });
    return obj;
  }

  initialize(numInputs: number, outputNames: Intent[]): void {
    this.perceptronsByName = {};
    this.perceptrons = [];
    this.outputs = {};
    this.numPerceptrons = outputNames.length;
    for (let i = 0; i < outputNames.length; i += 1) {
      const name = outputNames[i];
      this.outputs[name] = 0;
      const perceptron: Perceptron = {
        name,
        id: i,
        weights: new Float32Array(numInputs),
        changes: new Float32Array(numInputs),
        bias: 0,
      };
      this.perceptrons.push(perceptron);
      this.perceptronsByName[name] = perceptron;
    }
  }

  runInputPerceptron(perceptron: Perceptron, input: SparseVector): number {
    const { keys, values } = input;
    const { weights } = perceptron;
    let sum = perceptron.bias;
    for (let i = 0; i < keys.length; i += 1) {
      sum += values[i] * weights[keys[i]];
    }
    return sum <= 0 ? 0 : this.settings.alpha * sum;
  }

  runInput(input: SparseVector): IntentMap {
    for (let i = 0; i < this.numPerceptrons; i += 1) {
      this.outputs[this.perceptrons[i].name] = this.runInputPerceptron(
        this.perceptrons[i],
        input
      );
    }
    return this.outputs;
  }

  get isRunnable(): boolean {
    return !!this.numPerceptrons;
  }

  /** Scores every intent for an utterance, or nothing when untrained. */
  run(input: FeatureMap): IntentMap | undefined {
    return this.numPerceptrons
      ? this.runInput(this.lookup.transformInput(input))
      : undefined;
  }

  prepareCorpus(corpus: Corpus): PreparedEntry[] {
    this.lookup = new CorpusLookup();
    return this.lookup.build(corpus);
  }

  /** Builds the perceptrons of a prepared corpus, if it has none yet. */
  verifyIsInitialized(): void {
    if (!this.perceptrons && this.lookup) {
      this.initialize(this.lookup.numInputs, this.lookup.outputLookup.items);
    }
  }

  /** Trains one perceptron over the corpus, returning its squared error. */
  trainPerceptron(perceptron: Perceptron, data: PreparedEntry[]): number {
    const { alpha, momentum } = this.settings;
    const { changes, id, weights } = perceptron;
    let error = 0;
    for (let i = 0; i < data.length; i += 1) {
      const { input, output } = data[i];
      const actualOutput = this.runInputPerceptron(perceptron, input);
      let expectedOutput = 0;
      for (let j = 0; j < output.keys.length; j += 1) {
        if (output.keys[j] === id) {
          expectedOutput = output.values[j] || 0;
          break;
        }
      }
      const currentError = expectedOutput - actualOutput;
      if (currentError) {
        error += currentError ** 2;
        const delta =
          (actualOutput > 0 ? 1 : alpha) *
          currentError *
          this.decayLearningRate;
        const { keys, values } = input;
        for (let j = 0; j < keys.length; j += 1) {
          const key = keys[j];
          const change = delta * values[j] + momentum * changes[key];
          changes[key] = change;
          weights[key] += change;
        }
        perceptron.bias += delta;
      }
    }
    return error;
  }

  train(corpus?: Corpus): TrainResult {
    if (!corpus || !corpus.length) {
      return {};
    }
    const useNoneFeature =
      corpus[corpus.length - 1].input.nonefeature !== undefined;
    if (useNoneFeature) {
      const intents: Record<Intent, number> = {};
      for (let i = 0; i < corpus.length - 1; i += 1) {
        const tokens = Object.keys(corpus[i].output);
        for (let j = 0; j < tokens.length; j += 1) {
          if (!intents[tokens[j]]) {
            intents[tokens[j]] = 1;
          }
        }
      }
      const current = corpus[corpus.length - 1];
      const keys = Object.keys(intents);
      for (let i = 0; i < keys.length; i += 1) {
        current.output[keys[i]] = 0.0000001;
      }
    }
    const data = this.prepareCorpus(corpus);
    if (!this.status) {
      this.status = { error: Infinity, deltaError: Infinity, iterations: 0 };
    }
    this.verifyIsInitialized();
    const { learningRate } = this.settings;
    this.baseLearningRate =
      typeof learningRate === 'number'
        ? learningRate
        : autoLearningRate(data.length);
    const minError = this.settings.errorThresh;
    const minDelta = this.settings.deltaErrorThresh;
    while (
      this.status.iterations < this.settings.iterations &&
      this.status.error > minError &&
      this.status.deltaError > minDelta
    ) {
      const hrstart = new Date();
      this.status.iterations += 1;
      this.decayLearningRate =
        this.baseLearningRate / (1 + 0.001 * this.status.iterations);
      const lastError = this.status.error;
      this.status.error = 0;
      for (let i = 0; i < this.numPerceptrons; i += 1) {
        this.status.error += this.trainPerceptron(this.perceptrons[i], data);
      }
      this.status.error /= this.numPerceptrons * data.length;
      this.status.deltaError = Math.abs(this.status.error - lastError);
      const hrend = new Date();
      if (this.logFn) {
        this.logFn(this.status, hrend.getTime() - hrstart.getTime());
      }
    }
    return this.status;
  }

  /**
   * Weight every feature of an utterance carries for one intent. Empty when
   * the network is untrained, or when it does not know the intent.
   */
  explain(input: FeatureMap, intent: Intent): Explanation {
    const { lookup } = this;
    if (!lookup) {
      return {};
    }
    const transformedInput = lookup.transformInput(input);
    const result: Record<string, number> = {};
    const intentIndex = lookup.outputLookup.dict.get(intent);
    if (intentIndex === undefined) {
      return {};
    }
    for (let i = 0; i < transformedInput.keys.length; i += 1) {
      const key = transformedInput.keys[i];
      result[lookup.inputLookup.items[key]] =
        this.perceptrons[intentIndex].weights[key];
    }
    return {
      weights: result,
      bias: this.perceptrons[intentIndex].bias,
    };
  }

  toJSON(): NeuralNetworkJson {
    const settings: NeuralNetworkSettings = {};
    const keys = Object.keys(this.settings);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (this.settings[key] !== defaultSettings[key]) {
        settings[key] = this.settings[key];
      }
    }
    if (!this.lookup) {
      return {
        settings,
      };
    }
    const features = this.lookup.inputLookup.items;
    const intents = this.lookup.outputLookup.items;
    const perceptrons: number[][] = [];
    for (let i = 0; i < this.perceptrons.length; i += 1) {
      const perceptron = this.perceptrons[i];
      const weights = [...perceptron.weights, perceptron.bias];
      perceptrons.push(weights);
    }
    return {
      settings,
      features,
      intents,
      perceptrons,
    };
  }

  fromJSON(json: NeuralNetworkJson): void {
    this.settings = this.applySettings({
      ...defaultSettings,
      ...json.settings,
    });
    if (json.features) {
      this.lookup = new CorpusLookup(json.features, json.intents);
      this.initialize(json.features.length, json.intents);
      for (let i = 0; i < this.perceptrons.length; i += 1) {
        const perceptron = this.perceptrons[i];
        const data = json.perceptrons[i];
        perceptron.bias = data[data.length - 1];
        for (let j = 0; j < json.features.length; j += 1) {
          perceptron.weights[j] = data[j];
        }
      }
    }
  }
}

export default NeuralNetwork;
