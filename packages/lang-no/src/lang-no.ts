import TokenizerNo from './tokenizer-no.js';
import StemmerNo from './stemmer-no.js';
import StopwordsNo from './stopwords-no.js';
import NormalizerNo from './normalizer-no.js';
import SentimentNo from './sentiment/sentiment_no.js';

class LangNo {
  register(container) {
    container.use(TokenizerNo);
    container.use(StemmerNo);
    container.use(StopwordsNo);
    container.use(NormalizerNo);
    container.register('sentiment-no', SentimentNo);
  }
}

export default LangNo;
