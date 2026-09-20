import TokenizerHu from './tokenizer-hu.js';
import StemmerHu from './stemmer-hu.js';
import StopwordsHu from './stopwords-hu.js';
import NormalizerHu from './normalizer-hu.js';
import SentimentHu from './sentiment/sentiment_hu.js';
import registerTrigrams from './trigrams.js';

class LangHu {
  register(container) {
    container.use(TokenizerHu);
    container.use(StemmerHu);
    container.use(StopwordsHu);
    container.use(NormalizerHu);
    container.register('sentiment-hu', SentimentHu);
    registerTrigrams(container);
  }
}

export default LangHu;
