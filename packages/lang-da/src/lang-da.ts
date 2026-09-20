import TokenizerDa from './tokenizer-da.js';
import StemmerDa from './stemmer-da.js';
import StopwordsDa from './stopwords-da.js';
import NormalizerDa from './normalizer-da.js';
import SentimentDa from './sentiment/sentiment_da.js';
import registerTrigrams from './trigrams.js';

class LangDa {
  register(container) {
    container.use(TokenizerDa);
    container.use(StemmerDa);
    container.use(StopwordsDa);
    container.use(NormalizerDa);
    container.register('sentiment-da', SentimentDa);
    registerTrigrams(container);
  }
}

export default LangDa;
