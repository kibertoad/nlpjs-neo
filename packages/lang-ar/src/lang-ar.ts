import StemmerAr from './stemmer-ar.js';
import TokenizerAr from './tokenizer-ar.js';
import StopwordsAr from './stopwords-ar.js';
import NormalizerAr from './normalizer-ar.js';
import SentimentAr from './sentiment/sentiment_ar.js';
import registerTrigrams from './trigrams.js';

class LangAr {
  register(container) {
    container.use(StemmerAr);
    container.use(TokenizerAr);
    container.use(StopwordsAr);
    container.use(NormalizerAr);
    container.register('sentiment-ar', SentimentAr);
    registerTrigrams(container);
  }
}

export default LangAr;
