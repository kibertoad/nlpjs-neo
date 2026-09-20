import TokenizerFi from './tokenizer-fi.js';
import StemmerFi from './stemmer-fi.js';
import StopwordsFi from './stopwords-fi.js';
import NormalizerFi from './normalizer-fi.js';
import SentimentFi from './sentiment/sentiment_fi.js';
import registerTrigrams from './trigrams.js';

class LangFi {
  register(container) {
    container.use(TokenizerFi);
    container.use(StemmerFi);
    container.use(StopwordsFi);
    container.use(NormalizerFi);
    container.register('sentiment-fi', SentimentFi);
    registerTrigrams(container);
  }
}

export default LangFi;
