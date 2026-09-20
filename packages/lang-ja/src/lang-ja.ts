import TokenizerJa from './tokenizer-ja.js';
import StemmerJa from './stemmer-ja.js';
import StopwordsJa from './stopwords-ja.js';
import NormalizerJa from './normalizer-ja.js';
import SentimentJa from './sentiment/sentiment_ja.js';

class LangJa {
  register(container) {
    container.use(TokenizerJa);
    container.use(StemmerJa);
    container.use(StopwordsJa);
    container.use(NormalizerJa);
    container.register('sentiment-ja', SentimentJa);
  }
}

export default LangJa;
