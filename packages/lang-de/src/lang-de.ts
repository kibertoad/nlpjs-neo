import TokenizerDe from './tokenizer-de.js';
import StemmerDe from './stemmer-de.js';
import StopwordsDe from './stopwords-de.js';
import NormalizerDe from './normalizer-de.js';
import SentimentDe from './sentiment/sentiment_de.js';
import registerTrigrams from './trigrams.js';

class LangDe {
  register(container) {
    container.use(TokenizerDe);
    container.use(StemmerDe);
    container.use(StopwordsDe);
    container.use(NormalizerDe);
    container.register('sentiment-de', SentimentDe);
    registerTrigrams(container);
  }
}

export default LangDe;
