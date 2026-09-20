import type {
  Locale,
  NormalizerService,
  StemmerService,
  StopwordsService,
  Token,
  TokenizerService,
} from '@nlpjs-neo/core';

/**
 * Types of the language bundle: the classes a language pack exports, and the
 * vocabulary the bag of words helpers build.
 */

/** Scores an utterance for sentiment, as a language pack provides it. */
export interface SentimentService {
  getDictionary?(locale: Locale): unknown;
  [key: string]: unknown;
}

/** One of the services a language pack provides, once instantiated. */
export type LanguageService =
  | NormalizerService
  | TokenizerService
  | StemmerService
  | StopwordsService
  | SentimentService;

/** Constructor of one of those services. */
export type LanguageServiceConstructor = new () => LanguageService;

/**
 * A language pack, as its package exports it: the services of that language,
 * each under the name of its kind followed by the capitalized locale, as in
 * `TokenizerEn`.
 */
export type LanguagePack = Record<string, unknown>;

/** The words of a corpus, so a sentence can be turned into a vector. */
export interface Vocabulary {
  locale: Locale;
  /** Whether the words were stemmed before they were counted. */
  useStemmer: boolean;
  /** How often each word occurs in the corpus. */
  freqs: Record<Token, number>;
  /** Position of each word in the vector. */
  positions: Record<Token, number>;
  /** The words, in the order the positions give them. */
  keys: Token[];
  length: number;
}
