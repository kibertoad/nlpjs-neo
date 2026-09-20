import TokenizerFr from './tokenizer-fr.js';
import StemmerFr from './stemmer-fr.js';
import StopwordsFr from './stopwords-fr.js';
import NormalizerFr from './normalizer-fr.js';
import SentimentFr from './sentiment/sentiment_fr.js';
import registerTrigrams from './trigrams.js';

class LangFr {
  register(container) {
    container.use(TokenizerFr);
    container.use(StemmerFr);
    container.use(StopwordsFr);
    container.use(NormalizerFr);
    container.register('sentiment-fr', SentimentFr);
    registerTrigrams(container);
  }
}

export default LangFr;
