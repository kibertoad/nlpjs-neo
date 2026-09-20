import TokenizerTh from './tokenizer-th.js';
import StemmerTh from './stemmer-th.js';
import StopwordsTh from './stopwords-th.js';
import NormalizerTh from './normalizer-th.js';
import SentimentTh from './sentiment/sentiment_th.js';

class LangTh {
  register(container) {
    container.use(TokenizerTh);
    container.use(StemmerTh);
    container.use(StopwordsTh);
    container.use(NormalizerTh);
    container.register('sentiment-th', SentimentTh);
  }
}

export default LangTh;
