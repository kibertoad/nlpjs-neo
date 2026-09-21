import type {
  Locale,
  PipelineInput,
  SerializedInstance,
  Settings,
  TokenMap,
} from '@nlpjs-neo/core';
import type { NeuralNetworkJson, TrainResult } from '@nlpjs-neo/neural';

/**
 * Types of the natural language understanding packages: what a classifier is
 * trained with, what it answers and how a manager routes between them.
 */

/** Name of an intent a classifier can answer with. */
export type Intent = string;

/** A feature of an utterance, usually a stem. */
export type Feature = string;

/** Name of a domain an intent belongs to; `default` when none was given. */
export type Domain = string;

/**
 * Features known to a classifier, as a lookup set. Training writes `1`, which
 * the spell checker reads as the frequency of the feature.
 */
export type FeatureSet = Record<Feature, number>;

/**
 * Intents known to a classifier, as a lookup set. Training writes `1`; a
 * model exported by an older version may carry any truthy value.
 */
export type IntentSet = Record<Intent, number | boolean>;

/** Features seen for each intent while training, as lookup sets per intent. */
export type IntentFeatures = Record<Intent, FeatureSet>;

/** For each feature, the intents whose training utterances contained it. */
export type FeaturesToIntent = Record<Feature, Intent[]>;

/** One training example, as it is written in a corpus. */
export interface CorpusEntry {
  intent: Intent;
  utterance: string;
  /** Domain of the intent, when the corpus groups its intents. */
  domain?: Domain;
}

/** One training example after preparation: features in, intents out. */
export interface PreparedCorpusEntry {
  input: TokenMap;
  output: Record<Intent, number>;
}

/** One answer of a classifier: an intent and how sure it is of it. */
export interface Classification {
  intent: Intent;
  score: number;
}

/** Why a classifier answered an intent: the weight behind each of its stems. */
export interface ExplanationEntry {
  token: string;
  stem: string;
  weight: number | undefined;
}

/** Raw explanation a neural classifier produces for one intent. */
export interface NeuralExplanation {
  weights?: Record<Feature, number>;
  bias?: number;
}

/**
 * Intents a lookup may be restricted to: either patterns matched with
 * wildcards, or a lookup set of exact names.
 */
export type AllowList = string[] | Record<Intent, unknown>;

/**
 * Settings of a classifier. They are merged from the constructor, the
 * container configuration and imported models, so the bag stays open; the
 * keys below are the ones these classes read.
 */
export interface NluSettings extends Settings {
  locale?: Locale;
  tag?: string;
  /** When `false`, the prepare pipeline strips stopwords. */
  keepStopwords?: boolean;
  /** Weight given to the artificial `nonefeature` token. */
  nonefeatureValue?: number;
  /** Weight of the first unknown token of an utterance. */
  nonedeltaValue?: number;
  /** Factor applied to the delta for each further unknown token. */
  nonedeltaMultiplier?: number;
  /** Adds a `None` intent trained on the artificial feature. */
  useNoneFeature?: boolean;
  spellCheck?: boolean;
  spellCheckDistance?: number;
  /** Drops classifications scored zero from the answer. */
  filterZeros?: boolean;
  log?: boolean;
  /** Restricts which intents a lookup may answer. */
  allowList?: AllowList;
  /** Property of an object input to read the text from. */
  fieldNameSrc?: string;
  /** Property of the result to write the prepared tokens to. */
  fieldNameTgt?: string;
  returnExplanation?: boolean;
  /** Below this score, a manager answers `None` instead. */
  threshold?: number;
}

/**
 * What every input of these pipelines carries. Each stage fills in the
 * properties it owns and passes the whole input on.
 */
export interface NluInputBase extends PipelineInput {
  settings?: NluSettings;
  /** Answers of the classifier, as a map while scoring and a list after. */
  classifications?: Record<Intent, number> | Classification[];
  /** Legacy name a few classifiers answer their classifications under. */
  intents?: Record<Intent, number>;
}

/** Object flowing through the classifier pipelines. */
export interface NluInput extends NluInputBase {
  /**
   * Classifications a custom process pipeline may leave here instead of
   * under `classifications`; the normalizer moves them over.
   */
  nluAnswer?: Classification[];
  corpus?: CorpusEntry[] | PreparedCorpusEntry[];
  explanation?: NeuralExplanation;
  /** Filled in by `innerTrain` with how the training run went. */
  status?: TrainResult;
}

/**
 * A pipeline stage resolved from the container by name. Every one of them
 * takes the input, fills in what it owns and hands it back.
 */
export interface PipelineStage {
  run(input: NluInput): NluInput | Promise<NluInput>;
}

/** A pipeline stage that answers without waiting, such as the normalizer. */
export interface SyncPipelineStage {
  run(input: NluInput): NluInput;
}

/** What `Nlu.process` answers. */
export interface NluResult {
  classifications: Classification[];
  /** Always absent here: entities are added by the `ner` package. */
  entities: undefined;
  explanation: ExplanationEntry[] | undefined;
}

/** Settings of an `NluManager`. */
export interface NluManagerSettings extends NluSettings {
  /** Locales to build a domain manager for, as ISO-639-1 codes. */
  locales?: Locale[];
  /** Settings passed on to every domain manager this creates. */
  domain?: DomainManagerSettings;
  trainByDomain?: boolean;
}

/** Object flowing through the manager pipelines. */
export interface NluManagerInput extends NluInputBase {
  settings?: NluManagerSettings;
  /**
   * Locales to train, when a caller drives the training pipeline itself.
   * `train` never fills it in, so it trains every language that was added.
   */
  locales?: Locale | Locale[];
  /** Whole answer of the classifier a domain manager consulted. */
  nluAnswer?: NluResult;
  /** Locale reduced to its two letter form, filled in by `fillLanguage`. */
  localeIso2?: Locale;
  /** English name of the language, when it is known. */
  language?: string;
  /** `true` when the locale was guessed rather than given. */
  languageGuessed?: boolean;
  classifications?: Classification[];
  domain?: Domain;
  score?: number;
  classification?: DomainClassification;
}

/** Exported manager, as produced by `NluManager.toJSON`. */
export interface NluManagerJson extends SerializedInstance {
  settings: NluManagerSettings;
  locales: Locale[];
  languageNames: Record<Locale, { locale: Locale; name: string }>;
  domainManagers: Record<Locale, DomainManagerJson>;
  intentDomains: Record<Locale, Record<Intent, Domain>>;
  /** Sentences added to the language guesser at runtime. */
  extraSentences: [Locale, string][];
}

/** One utterance of a domain manager's corpus, before it is prepared. */
export interface DomainSentence {
  domain: Domain;
  utterance: string;
  intent: Intent;
}

/** Where an utterance whose exact stems were seen while training leads. */
export interface StemDictEntry {
  intent: Intent;
  domain: Domain;
}

/** Which classifier a domain is handled by, and how it is configured. */
export interface DomainNluSettings {
  className?: string;
  settings?: NluSettings;
}

/** Settings of a `DomainManager`. */
export interface DomainManagerSettings extends NluSettings {
  /** Classifier per domain; `default` covers the ones not named. */
  nluByDomain?: Record<Domain, DomainNluSettings>;
  /** Trains one classifier per domain instead of one over all of them. */
  trainByDomain?: boolean;
  /** Answers straight from `stemDict` when an utterance was seen verbatim. */
  useStemDict?: boolean;
}

/** What a domain manager answers: the domain, and the intents within it. */
export interface DomainClassification {
  domain: Domain;
  classifications: Classification[];
}

/**
 * Object flowing through the domain manager pipelines. Its corpus is grouped
 * by domain and its explanation may already be resolved to stems, so it sits
 * beside `NluInput` rather than extending it.
 */
export interface DomainManagerInput extends NluInputBase {
  settings?: DomainManagerSettings;
  /** Whole answer of the classifier of the domain that was consulted. */
  nluAnswer?: NluResult;
  /** Corpus grouped by domain, as `generateCorpus` builds it. */
  corpus?: Record<Domain, CorpusEntry[]>;
  /** Stems of the utterance, filled in by `prepare`. */
  stems?: TokenMap | Promise<TokenMap>;
  classification?: DomainClassification;
  /** Training status per domain. */
  status?: Record<Domain, unknown>;
  explanation?: NeuralExplanation | ExplanationEntry[];
}

/** Exported domain manager, as produced by `DomainManager.toJSON`. */
export interface DomainManagerJson extends SerializedInstance {
  settings: DomainManagerSettings;
  stemDict: Record<string, StemDictEntry>;
  intentDict: Record<Intent, Domain>;
  sentences: DomainSentence[];
  domains: Record<Domain, NluJson>;
}

/**
 * Exported classifier, as produced by `Nlu.toJSON`. Everything but the
 * settings is missing from the export of a classifier that never trained,
 * and `fromJSON` starts such a model from empty.
 */
export interface NluJson extends SerializedInstance {
  settings: NluSettings;
  features?: FeatureSet;
  intents?: IntentSet;
  intentFeatures?: IntentFeatures;
  featuresToIntent?: FeaturesToIntent;
  /** Present on a `NluNeural`, absent while it is still untrained. */
  neuralNetwork?: NeuralNetworkJson;
}
