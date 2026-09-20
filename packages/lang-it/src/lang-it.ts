import TokenizerIt from './tokenizer-it.js';
import StemmerIt from './stemmer-it.js';
import StopwordsIt from './stopwords-it.js';
import NormalizerIt from './normalizer-it.js';
import SentimentIt from './sentiment/sentiment_it.js';
import registerTrigrams from './trigrams.js';

class LangIt {
  register(container) {
    container.use(TokenizerIt);
    container.use(StemmerIt);
    container.use(StopwordsIt);
    container.use(NormalizerIt);
    container.register('sentiment-it', SentimentIt);
    registerTrigrams(container);
  }
}

export default LangIt;
