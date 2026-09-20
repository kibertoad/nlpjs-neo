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

const defaultSettings: NeuralNetworkSettings = {
  iterations: 20000,
  errorThresh: 0.00005,
  deltaErrorThresh: 0.000001,
  learningRate: 0.6,
  momentum: 0.5,
  alpha: 0.07,
  log: false,
};

class NeuralNetwork {
  /** Learning rate of the current iteration, decayed over time. */
  declare decayLearningRate: number;
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
    const sum = input.keys.reduce(
      (prev, key) => prev + input.data[key] * perceptron.weights[key],
      perceptron.bias
    );
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
    const { changes, weights } = perceptron;
    let error = 0;
    for (let i = 0; i < data.length; i += 1) {
      const { input, output } = data[i];
      const actualOutput = this.runInputPerceptron(perceptron, input);
      const expectedOutput = output.data[perceptron.id] || 0;
      const currentError = expectedOutput - actualOutput;
      if (currentError) {
        error += currentError ** 2;
        const delta =
          (actualOutput > 0 ? 1 : alpha) *
          currentError *
          this.decayLearningRate;
        for (let j = 0; j < input.keys.length; j += 1) {
          const key = input.keys[j];
          const change = delta * input.data[key] + momentum * changes[key];
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
        this.settings.learningRate / (1 + 0.001 * this.status.iterations);
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
    const intentIndex = lookup.outputLookup.dict[intent];
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
