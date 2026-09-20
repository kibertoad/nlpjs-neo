import TokenizerUk from './tokenizer-uk.js';
import StemmerUk from './stemmer-uk.js';
import StopwordsUk from './stopwords-uk.js';
import NormalizerUk from './normalizer-uk.js';
import SentimentUk from './sentiment/sentiment_uk.js';
import registerTrigrams from './trigrams.js';

class LangUk {
  register(container) {
    container.use(TokenizerUk);
    container.use(StemmerUk);
    container.use(StopwordsUk);
    container.use(NormalizerUk);
    container.register('sentiment-uk', SentimentUk);
    registerTrigrams(container);
  }
}

export default LangUk;
