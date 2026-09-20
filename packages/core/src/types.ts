import type { Container } from './container.js';

/**
 * Shared vocabulary of the pipeline oriented packages. The port from
 * JavaScript left most signatures untyped; these are the types the runtime
 * has always produced, written down so that callers get them back.
 */

/** Locale identifier: ISO-639-1 (`en`) or, for a few languages, BCP-47 (`zh-CN`). */
export type Locale = string;

/** A single token, as produced by a tokenizer. */
export type Token = string;

/**
 * Tokens mapped to a weight: `1` for plain presence (`ArrToObj`), a term
 * frequency for the similarity package, a float for a neural network input.
 */
export type TokenMap = Record<Token, number>;

/**
 * Tokens as they travel through a pipeline: an array up to `arrToObj`, a
 * weighted map after it.
 */
export type Tokens = Token[] | TokenMap;

/** Words marked as stopwords, used as a lookup set. */
export type StopwordDictionary = Record<Token, boolean>;

/**
 * Settings bag of a `Clonable`. Settings are merged from constructor
 * arguments, container configurations and imported JSON models, so the bag
 * stays open; the keys listed here are the ones the core classes read.
 */
export interface Settings {
  /** Name this instance is registered and configured under. */
  tag?: string;
  container?: Container;
  /** Name of the storage service a `Context` resolves from the container. */
  storageName?: string;
  /** When `false`, the stopwords stage strips stopwords from the tokens. */
  keepStopwords?: boolean;
  locale?: Locale;
  [key: string]: unknown;
}

/**
 * Object flowing through a pipeline. Every stage receives it, mutates the
 * properties it owns and returns it; plugins are free to add their own, so
 * the shape stays open.
 */
export interface PipelineInput {
  text?: string;
  utterance?: string;
  locale?: Locale;
  /** Intent an utterance is trained for, set by the training pipelines. */
  intent?: string;
  tokens?: Tokens;
  settings?: Settings;
  /** Start mark written by `Timer.start`, removed again by `Timer.stop`. */
  hrstart?: Date;
  /** Milliseconds between `Timer.start` and `Timer.stop`. */
  elapsed?: number;
  [key: string]: unknown;
}

/**
 * Second argument of the tokenizing and normalizing stages. Historically it
 * is a boolean flag that forces normalization on or off, and `undefined`
 * leaves the decision to the stage's own setting. The pipeline stages
 * forward the whole input object instead, which counts as `false`: the
 * normalizing stage runs before the tokenizing one, so the text reaching
 * the tokenizer is already normalized.
 */
export type NormalizeFlag = boolean | PipelineInput;

/** Item held by a storage service. `eTag` guards against lost updates. */
export interface StorageItem {
  eTag?: string;
  [key: string]: unknown;
}

/** Contract of the service registered in a container under `storage`. */
export interface Storage {
  read(keys: string | string[]): Promise<Record<string, StorageItem>>;
  write(changes: Record<string, StorageItem>): Promise<StorageItem>;
  delete(keys: string[]): Promise<void>;
}

/** Contract of the service registered in a container under `logger`. */
export interface Logger {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  log(...args: unknown[]): void;
  trace(...args: unknown[]): void;
  fatal(...args: unknown[]): void;
}

/** Text normalizing service, registered as `normalizer-<locale>`. */
export interface NormalizerService {
  normalize(text: string, input?: NormalizeFlag): string;
}

/** Tokenizing service, registered as `tokenizer-<locale>`. */
export interface TokenizerService {
  tokenize(text: string, normalize?: NormalizeFlag): Token[] | Promise<Token[]>;
}

/** Stemming service, registered as `stemmer-<locale>`. */
export interface StemmerService {
  stem(tokens: Token[], input?: PipelineInput): Token[] | Promise<Token[]>;
}

/** Stopword removing service, registered as `stopwords-<locale>`. */
export interface StopwordsService {
  removeStopwords(tokens: Token[], input?: PipelineInput): Token[];
}

/** One word of a compiled pipeline line. */
export interface PipelineToken {
  type: string;
  value?: string;
  arguments?: string[];
}

/** A compiled pipeline: one array of tokens per executable line. */
export type CompiledPipeline = PipelineToken[][];

/**
 * Either a container, or an object that carries one. The pipeline stages
 * accept both and resolve it as `holder.container || holder`.
 */
export type ContainerHolder = Container | { container: Container };

/**
 * Execution state kept by a compiler while it walks a compiled pipeline.
 * Path resolution only reads the values a pipeline put there, so the
 * bookkeeping of the walk itself is optional.
 */
export interface PipelineExecutionContext {
  cursor?: number;
  labels?: Record<string, number>;
  /** Result of the last comparison instruction, read by `je` and `jne`. */
  floating?: boolean;
  [key: string]: unknown;
}

/** Contract of a pipeline compiler registered in a container. */
export interface Compiler {
  name: string;
  compile(pipeline: string[]): CompiledPipeline;
  execute(
    compiled: CompiledPipeline,
    input: unknown,
    srcObject?: unknown,
    depth?: number
  ): unknown;
}

/** Constructor of a compiler, as accepted by `Container.registerCompiler`. */
export type CompilerConstructor = new (container: Container) => Compiler;

/** A pipeline as stored by a container: source, compiler and compiled form. */
export interface RegisteredPipeline {
  pipeline: string[];
  compiler: Compiler;
  compiled: CompiledPipeline;
}

/** A pipeline registered for the children of a container. */
export interface ChildPipeline {
  tag: string;
  pipeline: string[];
  overwrite: boolean;
}

/**
 * Entry of the container factory: either the singleton instance or the class
 * to instantiate on every `get`.
 */
export interface FactoryItem {
  name: string;
  isSingleton: boolean;
  // Resolution of a non singleton builds `new instance(settings, container)`,
  // so this holds either an instance or a constructor.
  instance: any;
}

/** Serialized form of an instance, as produced by `Container.toJSON`. */
export interface SerializedInstance {
  className?: string;
  [key: string]: unknown;
}
