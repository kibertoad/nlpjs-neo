import TokenizerLt from './tokenizer-lt.js';
import StemmerLt from './stemmer-lt.js';
import StopwordsLt from './stopwords-lt.js';
import NormalizerLt from './normalizer-lt.js';
import SentimentLt from './sentiment/sentiment_lt.js';

class LangLt {
  register(container) {
    container.use(TokenizerLt);
    container.use(StemmerLt);
    container.use(StopwordsLt);
    container.use(NormalizerLt);
    container.register('sentiment-lt', SentimentLt);
  }
}

export default LangLt;
