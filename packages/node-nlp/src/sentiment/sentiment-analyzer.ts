import { SentimentAnalyzer as SentimentAnalyzerBase } from '@nlpjs-neo/sentiment';
import { LangAll } from '@nlpjs-neo/lang-all';
import { Nlu } from '@nlpjs-neo/nlu';

class SentimentAnalyzer extends SentimentAnalyzerBase {
  constructor(settings: any = {}, container?) {
    super(settings, container);
    this.container.use(LangAll);
    this.container.use(Nlu);
  }

  async getSentiment(utterance, locale = 'en', settings: any = {}) {
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
