import TokenizerEu from './tokenizer-eu.js';
import StemmerEu from './stemmer-eu.js';
import StopwordsEu from './stopwords-eu.js';
import NormalizerEu from './normalizer-eu.js';
import SentimentEu from './sentiment/sentiment_eu.js';

class LangEu {
  register(container) {
    container.use(TokenizerEu);
    container.use(StemmerEu);
    container.use(StopwordsEu);
    container.use(NormalizerEu);
    container.register('sentiment-eu', SentimentEu);
  }
}

export default LangEu;
