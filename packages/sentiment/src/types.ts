import type { Locale, PipelineInput } from '@nlpjs-neo/core';

/** Overall polarity of an utterance. */
export type SentimentVote = 'positive' | 'negative' | 'neutral';

/** Dictionary a language provides, in order of preference. */
export type SentimentDictionaryType = 'senticon' | 'pattern' | 'afinn';

/** Words, or stems, mapped to the score they contribute. */
export type SentimentWordScores = Record<string, number>;

/** Dictionaries registered for a locale under `sentiment-<locale>`. */
export interface SentimentDictionaries {
  senticon?: SentimentWordScores;
  pattern?: SentimentWordScores;
  afinn?: SentimentWordScores;
  /** Words that flip the score of the words that follow them. */
  negations: { words: string[] };
  /** Whether the dictionary is keyed by stems rather than by words. */
  stemmed?: boolean;
}

/** The dictionary picked for the locale of an utterance. */
export interface SelectedDictionary {
  /** Absent when the locale has no sentiment dictionary at all. */
  type?: SentimentDictionaryType;
  dictionary?: SentimentWordScores;
  negations: string[];
  stemmed: boolean;
}

/** Sentiment of an utterance. */
export interface SentimentResult {
  /** Sum of the scores of the words found in the dictionary. */
  score: number;
  numWords: number;
  /** Words that contributed, negations included. */
  numHits: number;
  /** `score` per word of the utterance. */
  average: number;
  type?: SentimentDictionaryType;
  locale?: Locale;
  vote?: SentimentVote;
}

/** Pipeline input of the sentiment analyzer, with what it adds to it. */
export interface SentimentInput extends PipelineInput {
  sentiment?: SentimentResult;
  /** Dictionary picked for this utterance, removed again before returning. */
  sentimentDictionary?: SelectedDictionary;
}
