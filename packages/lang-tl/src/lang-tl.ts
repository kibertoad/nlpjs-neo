import TokenizerTl from './tokenizer-tl.js';
import StemmerTl from './stemmer-tl.js';
import StopwordsTl from './stopwords-tl.js';
import NormalizerTl from './normalizer-tl.js';
import SentimentTl from './sentiment/sentiment_tl.js';
import registerTrigrams from './trigrams.js';

class LangTl {
  register(container) {
    container.use(TokenizerTl);
    container.use(StemmerTl);
    container.use(StopwordsTl);
    container.use(NormalizerTl);
    container.register('sentiment-tl', SentimentTl);
    registerTrigrams(container);
  }
}

export default LangTl;
