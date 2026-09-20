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

/**
 * Per word overrides a stemmer applies around its rules: `before` short
 * circuits the rules for a word, `after` rewrites the stem they produced.
 */
export interface StemmerDictionary {
  before: Record<Token, Token>;
  after: Record<Token, Token>;
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

/**
 * Value resolved from a path expression of a pipeline. Paths are interpreted
 * at runtime against the container, the context and the input, so what comes
 * back is only known to the pipeline that asked for it. `unknown` would put a
 * cast on every pipeline step instead.
 */
// oxlint-disable-next-line typescript/no-explicit-any -- interpreted value
export type ResolvedValue = any;

/** A path expression resolved together with the kind of value it denotes. */
export interface ResolvedPath {
  type: 'literal' | 'function' | 'reference';
  /** Kind of the literal, for `type: 'literal'`. */
  subtype?: 'number' | 'string' | 'boolean';
  /** Source expression this was resolved from. */
  src: string;
  value: ResolvedValue;
  context: PipelineExecutionContext;
  container: Container;
}

/**
 * Result of running a pipeline: whatever its last step returned. A pipeline is
 * written at runtime, so only its author knows what comes back; this is the
 * documented boundary where a value leaves the type system.
 */
// oxlint-disable-next-line typescript/no-explicit-any -- pipeline result
export type PipelineResult = any;

/**
 * Instance rebuilt from an exported JSON model. The class is looked up by the
 * `className` the export carried, so the shape is known to the caller that
 * exported it and to nobody else.
 */
// oxlint-disable-next-line typescript/no-explicit-any -- rehydrated instance
export type RehydratedInstance = any;

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
 * Constructor of a service the container can build. Resolution calls it with
 * `(settings, container)`, but plugins registered by hand carry their own
 * signature, so the arguments stay open. `unknown[]` would reject every
 * constructor that declares narrower parameters, which is all of them.
 */
// oxlint-disable-next-line typescript/no-explicit-any -- open constructor
export type ServiceConstructor = new (...args: any[]) => object;

/**
 * A service registered by hand. `register` stores it under a name and hands
 * it back on resolution without reading anything off it, so a service is any
 * object at all, exposing whatever API its callers expect.
 */
export type ServiceInstance = object;

/**
 * An instance the container can `use`: it may name itself, carry settings and
 * register its own services when it is added.
 */
export interface ContainerPlugin {
  name?: string;
  settings?: Settings;
  /** Hook called when the plugin is added, to register its own services. */
  register?(container: Container): void;
}

/**
 * A resolved singleton that reconciles its own settings. `Clonable` provides
 * this; services registered by hand may not, so `get` tests for it.
 */
export interface ConfigurableService {
  settings?: Settings;
  applySettings?(current: Settings | undefined, settings: unknown): void;
}

/**
 * Entry of the container factory: either the singleton instance or the class
 * to instantiate on every `get`.
 */
export interface FactoryItem {
  name: string;
  isSingleton: boolean;
  /**
   * Resolution of a non singleton builds `new instance(settings, container)`,
   * so this holds either an instance or a constructor.
   */
  instance: ServiceConstructor | ServiceInstance | undefined;
}

/** Settings of a child container, as declared under `childs` of a configuration. */
export interface ChildSettings extends Settings {
  /** Set by the dock while it builds the child, so the child knows it is one. */
  isChild?: boolean;
  /** File the child loads its own pipelines from; defaults to `<name>_pipeline.md`. */
  pathPipeline?: string;
}

/** Service resolved by class name and re registered under another name. */
export interface TerraformEntry {
  className: string;
  name: string;
}

/**
 * Configuration a container is bootstrapped from: the parsed `conf.json`, or
 * the same shape passed in code. Every string value may be an `$ENV_VAR`
 * reference, which the bootstrap resolves before reading the configuration.
 */
export interface ContainerConfiguration {
  /** Environment variables to publish before the rest is resolved. */
  env?: Record<string, string>;
  /** Settings to register, keyed by the tag they configure. */
  settings?: Record<string, Settings>;
  /** Plugins to add: a plugin, a class, or a `[name, service]` pair. */
  use?: (
    | ContainerPlugin
    | ServiceConstructor
    | [string, ServiceConstructor | ServiceInstance]
  )[];
  terraform?: TerraformEntry[];
  /** Child containers to build, keyed by name. */
  childs?: Record<string, ChildSettings>;
  /** Pipelines in the pipeline file format, as a single string. */
  pipelines?: string;
  [key: string]: unknown;
}

/** Serialized form of an instance, as produced by `Container.toJSON`. */
export interface SerializedInstance {
  className?: string;
  [key: string]: unknown;
}
