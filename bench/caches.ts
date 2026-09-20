/**
 * Cache helpers shared by the benchmarks.
 *
 * Several steps of the pipeline memoize their work: `Tokenizer` keeps the
 * tokens of every text it has seen, `BaseStemmer` the stem of every word, and
 * `Nlu` the whole prepare step per locale and text. Feed any of them the same
 * utterance twice and the second call is a map lookup, so a benchmark that
 * names a cold path has to empty those memos between iterations — from an
 * untimed `beforeEach` hook, never from the measured function.
 *
 * Every cold benchmark in the repository does that through these helpers, so
 * that the memos worth clearing are listed once here rather than rediscovered,
 * differently, in each package.
 *
 * The memos are emptied rather than dropped: reassigning `cache` would push its
 * rebuild — a fresh object, and for the NLU prepare step a round of container
 * lookups — into the call being measured.
 */

/** A `Tokenizer`, which memoizes `tokenize()` per text. */
interface CachingTokenizer {
  cache?: {
    normalized: Record<string, string[]>;
    nonNormalized: Record<string, string[]>;
  };
}

/**
 * A `BaseStemmer`, which memoizes `stemWord()` per word. Its `getTokenizer`
 * promises only a tokenizer, so what it answers is read as a caching one
 * here, which every tokenizer of the repository is.
 */
interface CachingStemmer {
  cache: Record<string, string>;
  getTokenizer(): unknown;
}

/** An `Nlu` domain, which memoizes the tokens of the prepare step per locale and text. */
interface CachingNlu {
  cache?: { results: Record<string, Record<string, unknown>> };
}

/** An `NluManager`, holding one `Nlu` per domain of each locale it handles. */
interface CachingNluManager {
  container: { get(name: string): CachingTokenizer | undefined };
  domainManagers: Record<string, { domains: Record<string, CachingNlu> }>;
}

/** Forgets the tokens of every text this tokenizer has tokenized. */
export function clearTokenizerCache(tokenizer: CachingTokenizer): void {
  if (!tokenizer.cache) {
    return;
  }
  tokenizer.cache.normalized = {};
  tokenizer.cache.nonNormalized = {};
}

/**
 * Forgets every word this stemmer has stemmed, and the texts its tokenizer has
 * tokenized: `tokenizeAndStem` goes through both, so clearing only the stems
 * leaves the tokenizing half of it warm.
 */
export function clearStemmerCache(stemmer: CachingStemmer): void {
  stemmer.cache = {};
  clearTokenizerCache(stemmer.getTokenizer() as CachingTokenizer);
}

/**
 * Forgets every utterance this manager has prepared, in every domain of every
 * locale, along with the tokenizer memo underneath it. What stays warm is the
 * per-word stemmer cache, which a long-running process keeps warm too: a bot
 * sees new sentences all day, but hardly ever a new word.
 */
export function clearUtteranceCaches(manager: CachingNluManager): void {
  for (const locale of Object.keys(manager.domainManagers)) {
    const tokenizer = manager.container.get(`tokenizer-${locale}`);
    if (tokenizer) {
      clearTokenizerCache(tokenizer);
    }
    for (const nlu of Object.values(manager.domainManagers[locale].domains)) {
      if (nlu.cache) {
        nlu.cache.results = {};
      }
    }
  }
}
