import type { Settings } from '@nlpjs-neo/core-loader';
import type { NlpResult, NlpSettings } from '@nlpjs-neo/nlp';
import type { SentimentResult } from '@nlpjs-neo/sentiment';

/**
 * Types of the `node-nlp` compatibility layer: the settings its classes take,
 * and the Microsoft Bot Framework objects the recognizer talks to.
 *
 * The Bot Framework is not a dependency of this package -- the recognizer is
 * handed a bot and a session by the host application -- so what it touches is
 * described structurally here rather than imported.
 */

/** Rewrites a recognition before it is answered. */
export type ProcessTransformer = (
  result: NlpResult
) => NlpResult | Promise<NlpResult>;

/** Settings of an `NlpManager`. */
export interface NlpManagerSettings extends NlpSettings {
  /** Uses the logistic regression classifier instead of the neural one. */
  useLRC?: boolean;
  useNeural?: boolean;
  /** Called with every recognition, to rewrite it before it is answered. */
  processTransformer?: ProcessTransformer;
}

/** One intent of a corpus, with the utterances used to test it. */
export interface TestableIntent {
  intent: string;
  tests: string[];
}

/** A corpus with a test set, as `testCorpus` reads it. */
export interface TestableCorpus {
  locale: string;
  data: TestableIntent[];
}

/** How many of a corpus's test utterances were recognized correctly. */
export interface CorpusTestResult {
  total: number;
  good: number;
  bad: number;
}

/** Sentiment in the shape the legacy `SentimentManager` reports it. */
export interface LegacySentiment {
  score: number;
  comparative: number;
  vote: string;
  numWords: number;
  numHits: number;
  type: string;
  language: string;
}

/** The sentiment a `SentimentAnalyzer` answers, before it is translated. */
export type AnalyzedSentiment = SentimentResult;

/**
 * A Bot Framework session, as far as this recognizer reads it: the message
 * that arrived, its locale and where the conversation stands.
 */
export interface BotSession {
  locale?: string;
  message?: {
    text?: string;
    address?: { conversation?: { id?: string } };
  };
  /** The same message under the name newer versions of the SDK give it. */
  _activity?: {
    type?: string;
    text?: string;
    locale?: string;
    conversation?: { id?: string };
  };
  dialogStack?(): string[];
  beginDialog?(name: string): unknown;
  send?(answer: string): unknown;
  routeToActiveDialog?(): unknown;
  [key: string]: unknown;
}

/** State kept for one conversation, keyed by its identifier. */
export interface RecognizerContext {
  dialogId?: string;
  lastRecognized?: NlpResult;
  slotFill?: unknown;
  [key: string]: unknown;
}

/** One route the bot may dispatch a message to. */
export interface BotRoute {
  libraryName: string;
  [key: string]: unknown;
}

/**
 * A Bot Framework universal bot, as far as this recognizer drives it.
 */
export interface BotFrameworkBot {
  name: string;
  recognizer(recognizer: unknown): unknown;
  library(name: string): {
    selectRoute(session: BotSession, route: BotRoute): unknown;
  };
  libraries: Record<
    string,
    {
      constructor: {
        bestRouteResult(
          results: unknown,
          stack: string[],
          name: string
        ): BotRoute | undefined;
      };
    }
  >;
  [key: string]: unknown;
}

/**
 * Callback the Bot Framework hands a recognition. A session that carries no
 * message is answered with a score of zero and no intent, which is an
 * `NlpResult` with only those two properties filled in.
 */
export type RecognizeCallback = (
  err: Error | null,
  result?: NlpResult
) => unknown;

/** Runs when an intent names it. */
export type RecognizerAction = (
  recognizer: unknown,
  context: RecognizerContext,
  ...parameters: unknown[]
) => unknown;

/** Decides whether the recognizer takes over a message. */
export type RoutingHandler = (
  session: BotSession,
  ...args: unknown[]
) => unknown;

/** Settings of a `Recognizer`. */
export interface RecognizerSettings extends Settings {
  nlpManager?: unknown;
  /** Below this score, the recognizer answers nothing. */
  threshold?: number;
  /** Accuracy an entity must reach to be reported. */
  nerThreshold?: number;
  conversationContext?: unknown;
}
