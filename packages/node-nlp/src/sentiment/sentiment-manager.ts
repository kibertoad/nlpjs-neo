import type { Locale, Settings } from '@nlpjs-neo/core-loader';
import SentimentAnalyzer from './sentiment-analyzer.js';
import type { AnalyzedSentiment, LegacySentiment } from '../types.js';

/**
 * Class for the sentiment anlysis manager, able to manage
 * several different languages at the same time.
 */
class SentimentManager {
  declare analyzer: SentimentAnalyzer;
  /** Kept for the legacy API: every language is handled by one analyzer. */
  declare languages: Record<Locale, unknown>;
  declare settings: Settings;

  /**
   * Constructor of the class.
   */
  constructor(settings?: Settings) {
    this.settings = settings || {};
    this.languages = {};
    this.analyzer = new SentimentAnalyzer();
  }

  addLanguage(): void {
    // do nothing
  }

  /** Reports a sentiment under the names the legacy API used. */
  translate(sentiment: AnalyzedSentiment): LegacySentiment {
    let vote: string;
    if (sentiment.score > 0) {
      vote = 'positive';
    } else if (sentiment.score < 0) {
      vote = 'negative';
    } else {
      vote = 'neutral';
    }
    return {
      score: sentiment.score,
      comparative: sentiment.average,
      vote,
      numWords: sentiment.numWords,
      numHits: sentiment.numHits,
      type: sentiment.type,
      language: sentiment.locale,
    };
  }

  /**
   * Process a phrase of a given locale, calculating the sentiment analysis.
   * @param {String} locale Locale of the phrase.
   * @param {String} phrase Phrase to calculate the sentiment.
   * @returns {Promise.Object} Promise sentiment analysis of the phrase.
   */
  async process(locale, phrase?, _utterance?, _arg3?) {
    const sentiment = await this.analyzer.getSentiment(
      phrase,
      locale,
      this.settings
    );
    return this.translate(sentiment);
  }
}

export default SentimentManager;
