import TokenizerZh from './tokenizer-zh.js';
import StemmerZh from './stemmer-zh.js';
import StopwordsZh from './stopwords-zh.js';
import NormalizerZh from './normalizer-zh.js';
import SentimentZh from './sentiment/sentiment_zh.js';

class LangZh {
  register(container) {
    container.use(TokenizerZh);
    container.use(StemmerZh);
    container.use(StopwordsZh);
    container.use(NormalizerZh);
    container.register('sentiment-zh', SentimentZh);
  }
}

export default LangZh;
