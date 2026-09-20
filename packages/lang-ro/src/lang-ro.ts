import TokenizerRo from './tokenizer-ro.js';
import StemmerRo from './stemmer-ro.js';
import StopwordsRo from './stopwords-ro.js';
import NormalizerRo from './normalizer-ro.js';
import SentimentRo from './sentiment/sentiment_ro.js';

class LangRo {
  register(container) {
    container.use(TokenizerRo);
    container.use(StemmerRo);
    container.use(StopwordsRo);
    container.use(NormalizerRo);
    container.register('sentiment-ro', SentimentRo);
  }
}

export default LangRo;
