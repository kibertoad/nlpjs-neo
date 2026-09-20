import TokenizerMs from './tokenizer-ms.js';
import StemmerMs from './stemmer-ms.js';
import StopwordsMs from './stopwords-ms.js';
import NormalizerMs from './normalizer-ms.js';
import SentimentMs from './sentiment/sentiment_ms.js';

class LangMs {
  register(container) {
    container.use(TokenizerMs);
    container.use(StemmerMs);
    container.use(StopwordsMs);
    container.use(NormalizerMs);
    container.register('sentiment-ms', SentimentMs);
  }
}

export default LangMs;
