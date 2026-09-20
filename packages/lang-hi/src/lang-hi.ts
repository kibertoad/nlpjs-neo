import TokenizerHi from './tokenizer-hi.js';
import StemmerHi from './stemmer-hi.js';
import StopwordsHi from './stopwords-hi.js';
import NormalizerHi from './normalizer-hi.js';
import SentimentHi from './sentiment/sentiment_hi.js';
import registerTrigrams from './trigrams.js';

class LangHi {
  register(container) {
    container.use(TokenizerHi);
    container.use(StemmerHi);
    container.use(StopwordsHi);
    container.use(NormalizerHi);
    container.register('sentiment-hi', SentimentHi);
    registerTrigrams(container);
  }
}

export default LangHi;
