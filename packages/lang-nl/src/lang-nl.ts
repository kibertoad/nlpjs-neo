import TokenizerNl from './tokenizer-nl.js';
import StemmerNl from './stemmer-nl.js';
import StopwordsNl from './stopwords-nl.js';
import NormalizerNl from './normalizer-nl.js';
import SentimentNl from './sentiment/sentiment_nl.js';
import registerTrigrams from './trigrams.js';

class LangNl {
  register(container) {
    container.use(TokenizerNl);
    container.use(StemmerNl);
    container.use(StopwordsNl);
    container.use(NormalizerNl);
    container.register('sentiment-nl', SentimentNl);
    registerTrigrams(container);
  }
}

export default LangNl;
