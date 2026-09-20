import TokenizerFa from './tokenizer-fa.js';
import StemmerFa from './stemmer-fa.js';
import StopwordsFa from './stopwords-fa.js';
import NormalizerFa from './normalizer-fa.js';
import SentimentFa from './sentiment/sentiment_fa.js';
import registerTrigrams from './trigrams.js';

class LangFa {
  register(container) {
    container.use(TokenizerFa);
    container.use(StemmerFa);
    container.use(StopwordsFa);
    container.use(NormalizerFa);
    container.register('sentiment-fa', SentimentFa);
    registerTrigrams(container);
  }
}

export default LangFa;
