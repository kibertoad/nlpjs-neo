/**
 * Types of the perceptron network: the corpus it is trained with, the sparse
 * vectors it is fed and the JSON it exports.
 */

/** A feature of an utterance, usually a stem. */
export type Feature = string;

/** Name of an intent the network classifies into. */
export type Intent = string;

/** Features of an utterance mapped to their weight. */
export type FeatureMap = Record<Feature, number>;

/** Intents mapped to a score between 0 and 1. */
export type IntentMap = Record<Intent, number>;

/** One trainable example: the features of an utterance and its intents. */
export interface CorpusEntry {
  input: FeatureMap;
  output: IntentMap;
}

export type Corpus = CorpusEntry[];

/**
 * A vector in the compact form the network trains on: the ids of the terms
 * that are present, and the value of each one at the same position.
 */
export interface SparseVector {
  keys: number[];
  values: number[];
}

/** A corpus entry with both sides translated into sparse vectors. */
export interface PreparedEntry {
  input: SparseVector;
  output: SparseVector;
}

/** Progress of a training run, also the resting state of a trained network. */
export interface TrainStatus {
  /** Mean squared error of the last iteration. */
  error: number;
  /** How much the error moved in the last iteration. */
  deltaError: number;
  iterations: number;
}

/** Status of a training run; empty when there was nothing to train on. */
export type TrainResult = TrainStatus | Record<string, never>;

/** Called after every iteration when logging is enabled. */
export type TrainLogger = (status: TrainStatus, elapsed: number) => void;

/**
 * How far a wrong answer moves the weights: a fixed rate, or `'auto'` to
 * derive one from the size of the corpus that is trained. `'auto'` is the
 * default, so the setting always reads back as one of the two and never as
 * `undefined`; the rate a training resolved is `NeuralNetwork#baseLearningRate`.
 */
export type LearningRate = number | 'auto';

export interface NeuralNetworkSettings {
  /** Maximum number of iterations. */
  iterations?: number;
  /** Stop once the error drops below this. */
  errorThresh?: number;
  /** Stop once the error moves less than this between iterations. */
  deltaErrorThresh?: number;
  /** How far a wrong answer moves the weights; `'auto'` by default. */
  learningRate?: LearningRate;
  momentum?: number;
  /** Leak of the activation function for negative sums. */
  alpha?: number;
  /** `true` logs each iteration to the console, or pass a logger. */
  log?: boolean | TrainLogger;
  [key: string]: unknown;
}

/** One perceptron: the weights of an intent over every known feature. */
export interface Perceptron {
  name: Intent;
  /** Position of this perceptron, and of its intent in the output lookup. */
  id: number;
  weights: Float32Array;
  /** Last change applied to every weight, used by the momentum term. */
  changes: Float32Array;
  bias: number;
}

/**
 * Exported network. Everything but the settings is missing while the network
 * is still untrained.
 */
export interface NeuralNetworkJson {
  /** Only the settings that differ from the defaults. */
  settings: NeuralNetworkSettings;
  features?: Feature[];
  intents?: Intent[];
  /** Weights of every perceptron, with its bias as the last element. */
  perceptrons?: number[][];
  // Models exported by older versions carry keys this network no longer
  // reads, such as `sizes` and `layers`; importing one must still work.
  [key: string]: unknown;
}

/** Why the network classified an utterance into an intent. */
export interface Explanation {
  /** Weight every feature of the utterance carries for that intent. */
  weights?: Record<Feature, number>;
  bias?: number;
}
