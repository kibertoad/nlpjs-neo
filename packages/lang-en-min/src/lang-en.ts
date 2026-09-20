import TokenizerEn from './tokenizer-en.js';
import StemmerEn from './stemmer-en.js';
import StopwordsEn from './stopwords-en.js';
import NormalizerEn from './normalizer-en.js';
import SentimentEn from './sentiment/sentiment_en.js';
import registerTrigrams from './trigrams.js';

class LangEn {
  register(container) {
    container.use(TokenizerEn);
    container.use(StemmerEn);
    container.use(StopwordsEn);
    container.use(NormalizerEn);
    container.register('sentiment-en', SentimentEn);
    registerTrigrams(container);
  }
}

export default LangEn;
