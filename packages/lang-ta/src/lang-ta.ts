import TokenizerTa from './tokenizer-ta.js';
import StemmerTa from './stemmer-ta.js';
import StopwordsTa from './stopwords-ta.js';
import NormalizerTa from './normalizer-ta.js';
import SentimentTa from './sentiment/sentiment_ta.js';

class LangTa {
  register(container) {
    container.use(TokenizerTa);
    container.use(StemmerTa);
    container.use(StopwordsTa);
    container.use(NormalizerTa);
    container.register('sentiment-ta', SentimentTa);
  }
}

export default LangTa;
