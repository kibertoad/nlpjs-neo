import TokenizerCa from './tokenizer-ca.js';
import StemmerCa from './stemmer-ca.js';
import StopwordsCa from './stopwords-ca.js';
import NormalizerCa from './normalizer-ca.js';
import SentimentCa from './sentiment/sentiment_ca.js';
import registerTrigrams from './trigrams.js';

class LangCa {
  register(container) {
    container.use(TokenizerCa);
    container.use(StemmerCa);
    container.use(StopwordsCa);
    container.use(NormalizerCa);
    container.register('sentiment-ca', SentimentCa);
    registerTrigrams(container);
  }
}

export default LangCa;
