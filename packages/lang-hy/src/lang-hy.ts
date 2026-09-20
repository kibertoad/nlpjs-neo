import StemmerHy from './stemmer-hy.js';
import TokenizerHy from './tokenizer-hy.js';
import StopwordsHy from './stopwords-hy.js';
import NormalizerHy from './normalizer-hy.js';
import SentimentHy from './sentiment/sentiment_hy.js';

class LangHy {
  register(container) {
    container.use(StemmerHy);
    container.use(TokenizerHy);
    container.use(StopwordsHy);
    container.use(NormalizerHy);
    container.register('sentiment-hy', SentimentHy);
  }
}

export default LangHy;
