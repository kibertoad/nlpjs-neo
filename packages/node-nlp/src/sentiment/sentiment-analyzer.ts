import { SentimentAnalyzer as SentimentAnalyzerBase } from '@nlpjs-neo/sentiment';
import type { SentimentInput, SentimentResult } from '@nlpjs-neo/sentiment';
import type { Container, Locale, Settings } from '@nlpjs-neo/core-loader';
import { LangAll } from '@nlpjs-neo/lang-all';
import { Nlu } from '@nlpjs-neo/nlu';

class SentimentAnalyzer extends SentimentAnalyzerBase {
  constructor(settings: Settings = {}, container?: Container) {
    super(settings, container);
    this.container.use(LangAll);
    this.container.use(Nlu);
  }

  async getSentiment(
    utterance: string,
    locale: Locale = 'en',
    settings: Partial<SentimentInput> = {}
  ): Promise<SentimentResult | undefined> {
    const input = {
      utterance,
      locale,
      ...settings,
    };
    const result = await this.process(input);
    return result.sentiment;
  }
}

export default SentimentAnalyzer;
