import TokenizerId from './tokenizer-id.js';
import StemmerId from './stemmer-id.js';
import StopwordsId from './stopwords-id.js';
import NormalizerId from './normalizer-id.js';
import SentimentId from './sentiment/sentiment_id.js';
import registerTrigrams from './trigrams.js';

class LangId {
  register(container) {
    container.use(TokenizerId);
    container.use(StemmerId);
    container.use(StopwordsId);
    container.use(NormalizerId);
    container.register('sentiment-id', SentimentId);
    registerTrigrams(container);
  }
}

export default LangId;
