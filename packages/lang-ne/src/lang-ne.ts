import TokenizerNe from './tokenizer-ne.js';
import StemmerNe from './stemmer-ne.js';
import StopwordsNe from './stopwords-ne.js';
import NormalizerNe from './normalizer-ne.js';
import SentimentNe from './sentiment/sentiment_ne.js';

class LangNe {
  register(container) {
    container.use(TokenizerNe);
    container.use(StemmerNe);
    container.use(StopwordsNe);
    container.use(NormalizerNe);
    container.register('sentiment-ne', SentimentNe);
  }
}

export default LangNe;
