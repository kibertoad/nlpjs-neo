import type {
  Locale,
  SerializedInstance,
  Settings,
  Storage,
} from '@nlpjs-neo/core';
import type {
  Edge,
  EntityName,
  NerJson,
  NerSettings,
  TrimOptions,
} from '@nlpjs-neo/ner';
import type {
  Domain,
  Intent,
  NluManagerJson,
  NluManagerSettings,
  NluSettings,
} from '@nlpjs-neo/nlu';
import type {
  ActionManagerJson,
  Answer,
  AnswerOptions,
  AnswerPayload,
  StructuredAnswer,
  NlgManagerJson,
} from '@nlpjs-neo/nlg';
import type { SlotFillState, SlotsByIntent } from '@nlpjs-neo/slot';
import type { SentimentResult } from '@nlpjs-neo/sentiment';
import type Nlp from './nlp.js';

/**
 * Types of the `nlp` facade: what a corpus declares, what a turn of a
 * conversation carries and what the facade exports.
 */

/** Conversation state, kept between the turns of one conversation. */
export interface Context {
  /** Identifier this context is stored under. */
  conversationId?: string | number;
  id?: string;
  channel?: string;
  app?: string;
  from?: unknown;
  locale?: Locale;
  dialogStack?: unknown[];
  [key: string]: unknown;
}

/** Settings of a `ContextManager`. */
export interface ContextManagerSettings extends Settings {
  /**
   * Table a registered database keeps the contexts in. Without a database,
   * they are kept in memory under this name all the same.
   */
  tableName?: string;
}

/** Called with the stored context every time one is written. */
export type ContextUpdateHandler = (context: Context) => unknown;

/** Answers the identifier of the conversation an input belongs to. */
export type ContextIdResolver = (input: ContextInput) => unknown;

/** What a context is resolved from: the activity the channel delivered. */
export interface ContextInput {
  activity?: {
    id?: string;
    /** Channels identify a conversation by a string; a few use a number. */
    conversation?: { id?: string | number };
    address?: { conversation?: { id?: string | number } };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Store the contexts are kept in, when one is registered. */
export interface ContextDatabase extends Partial<Storage> {
  findOne(table: string, query: Record<string, unknown>): Promise<Context>;
  save(table: string, item: Context): Promise<unknown>;
}

/** Where a trim entity is anchored, as a corpus declares it. */
export interface TrimEntityDefinition {
  position: string;
  words?: string | string[];
  leftWords?: string | string[];
  rightWords?: string | string[];
  opts?: TrimOptions;
}

/** An entity as a corpus declares it: options, expressions or trims. */
export interface EntityDefinition {
  /** Locales this entity is declared for; all of them when absent. */
  locale?: Locale | Locale[];
  /** How it is recognized, when a corpus states it rather than implying it. */
  type?: string;
  /** Texts per option of an enum entity. */
  options?: Record<string, string | string[]>;
  regex?: string | string[];
  trim?: TrimEntityDefinition[];
}

/**
 * An answer as a corpus declares it: text, text with the options that gate
 * it, or structured data that is answered as it stands.
 */
export type AnswerDefinition =
  | string
  | { answer: AnswerPayload; opts?: string | AnswerOptions }
  | StructuredAnswer;

/** A slot as a corpus declares it: a question, or a question and whether it is required. */
export type SlotDefinition = string | { question: string; mandatory?: boolean };

/** An action as a corpus declares it. */
export type ActionDefinition =
  | string
  | { name?: string; parameters?: unknown[] };

/** One intent of a corpus: what is said, what is answered, what is needed. */
export interface CorpusIntent {
  intent: Intent;
  utterances: string[];
  answers?: AnswerDefinition[];
  /** Entities that must be filled before the intent can be answered. */
  slotFilling?: Record<EntityName, SlotDefinition>;
  actions?: ActionDefinition[];
}

/** One locale of a corpus that groups its intents by domain. */
export interface CorpusDomain {
  name: Domain;
  locale: Locale;
  data: CorpusIntent[];
  entities?: Record<EntityName, EntityDefinition | string>;
}

/** A corpus: intents for one locale, or grouped into domains. */
export interface Corpus {
  locale?: Locale;
  data?: CorpusIntent[];
  entities?: Record<EntityName, EntityDefinition | string>;
  domains?: CorpusDomain[];
  /** Context every conversation starts from, inline or as a file name. */
  contextData?: string | Record<string, unknown>;
}

/** A corpus to be read through a registered importer rather than directly. */
export interface ImportedCorpus {
  /** Name of the importer registered in the container. */
  importer: string;
  content?: string;
  filename?: string;
  [key: string]: unknown;
}

/** Turns the content of a file into the corpora it holds. */
export interface CorpusImporter {
  transform(content: string, input: ImportedCorpus): Corpus[];
}

/** Settings of an `Nlp`. */
export interface NlpSettings extends Settings {
  /** Below this score, the answer becomes `None`. */
  threshold?: number;
  /** Reads the exported model on start. */
  autoLoad?: boolean;
  /** Writes the exported model after training. */
  autoSave?: boolean;
  modelFileName?: string;
  /** Runs the actions before the answer is chosen rather than after. */
  executeActionsBeforeAnswers?: boolean;
  /** Adds the sentiment of the utterance to every answer. */
  calculateSentiment?: boolean;
  /** Extracts entities even when no intent needs a slot filled. */
  forceNER?: boolean;
  languages?: Locale[];
  locales?: Locale[];
  /** Corpora to add on start, as file names or as corpora. */
  corpora?: (string | Corpus | ImportedCorpus)[];
  /** Classifier per domain, per locale. */
  nlu?: NluManagerSettings & Record<string, unknown>;
  ner?: NerSettings;
  nlg?: Settings;
  action?: Settings;
  sentiment?: Settings;
  slot?: Settings;
  context?: ContextManagerSettings;
}

/** An entity found in an utterance, or the list of them found under one name. */
export interface StructuredEntity {
  entity?: EntityName;
  /** Present when several entities share a name. */
  isList?: boolean;
  items?: StructuredEntity[];
  /** Name this entity is also published under, such as `hero_1`. */
  alias?: string;
  sourceText?: string;
  [key: string]: unknown;
}

/** Called after every recognition, instead of the `onIntent(...)` pipeline. */
export type IntentHandler = (nlp: Nlp, result: NlpResult) => unknown;

/** Answer of a question this could not classify, from a registered service. */
export interface OpenQuestionService {
  getAnswer(
    locale: Locale,
    utterance: string
  ): Promise<{ answer?: string; position?: number; score?: number }>;
}

/**
 * What `Nlp.process` answers. It is the recognition result, with whatever the
 * connectors and plugins added along the way, so the shape stays open.
 */
export interface NlpResult {
  locale?: Locale;
  utterance?: string;
  intent?: Intent;
  domain?: Domain;
  score?: number;
  answer?: AnswerPayload;
  answers?: Answer[];
  /** Edges while extraction runs, organized entities once it is done. */
  entities?: (Edge | StructuredEntity)[];
  sourceEntities?: unknown[];
  sentiment?: SentimentResult;
  context?: Context;
  /** The utterance with its entities rewritten, when that scored better. */
  optionalUtterance?: string;
  srcAnswer?: string;
  slotFill?: SlotFillState;
  isOpenQuestionAnswer?: boolean;
  openQuestionFirstCharacter?: number;
  openQuestionScore?: number;
  [key: string]: unknown;
}

/** Exported facade, as produced by `Nlp.toJSON`. */
export interface NlpJson extends SerializedInstance {
  settings: NlpSettings;
  nluManager: NluManagerJson;
  ner: NerJson;
  nlgManager: NlgManagerJson;
  actionManager: ActionManagerJson;
  slotManager: SlotsByIntent;
}

/** Settings of one classifier, as `useNlu` records them. */
export interface NluClassSettings extends NluSettings {
  className?: string;
}
