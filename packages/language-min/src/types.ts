/**
 * Types of the language guesser: the trigram models it compares an utterance
 * against, and the answers it gives.
 */

/** A three letter sequence of an utterance. */
export type Trigram = string;

/** Name of a writing system, as `data.json` keys its models. */
export type ScriptName = string;

/** ISO-639-3 code of a language. */
export type Alpha3 = string;

/** ISO-639-1 code of a language. */
export type Alpha2 = string;

/** One language of `languages.json`. */
export interface LanguageInfo {
  alpha2: Alpha2;
  alpha3: Alpha3;
  name: string;
}

/**
 * Model of one language: its trigrams by rank, the most frequent last. The
 * raw model is the packed string `addModel` expands into this.
 */
export type TrigramModel = Record<Trigram, number>;

/** The languages written in one script, by ISO-639-3 code. */
export type ScriptModels = Record<Alpha3, TrigramModel>;

/** Every model, by script. Packed on disk, expanded on first load. */
export type LanguageData = Record<ScriptName, ScriptModels>;

/** One trigram of an utterance and how often it occurs in it. */
export type TrigramTuple = [Trigram, number];

/** A candidate and its score: a language code, or `und` when none was found. */
export type LanguageScore = [Alpha3 | ScriptName, number];

/** The script an utterance is written in, and how much of it is. */
export type TopScript = [ScriptName | undefined, number];

/** One answer of the guesser. */
export interface LanguageGuess {
  alpha3: Alpha3;
  alpha2: Alpha2;
  language: string;
  score: number;
}

/** How a detection is restricted and when it is attempted at all. */
export interface DetectSettings {
  /** Utterances shorter than this are not guessed at. Defaults to 10. */
  minLength?: number;
  /** Only these languages may be answered, as ISO-639-3 codes. */
  allowList?: Alpha3[];
  /** These languages may not be answered, as ISO-639-3 codes. */
  denyList?: Alpha3[];
}

/** A sentence added to the models at runtime, as it is exported. */
export type ExtraSentence = [Alpha2 | Alpha3, string];
