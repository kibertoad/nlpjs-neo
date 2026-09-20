import TokenizerCs from './tokenizer-cs.js';
import StemmerCs from './stemmer-cs.js';
import StopwordsCs from './stopwords-cs.js';
import NormalizerCs from './normalizer-cs.js';
import SentimentCs from './sentiment/sentiment_cs.js';
import registerTrigrams from './trigrams.js';

class LangCs {
  register(container) {
    container.use(TokenizerCs);
    container.use(StemmerCs);
    container.use(StopwordsCs);
    container.use(NormalizerCs);
    container.register('sentiment-cs', SentimentCs);
    registerTrigrams(container);
  }
}

export default LangCs;
