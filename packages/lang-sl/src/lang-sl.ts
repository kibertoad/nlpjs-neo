import TokenizerSl from './tokenizer-sl.js';
import StemmerSl from './stemmer-sl.js';
import StopwordsSl from './stopwords-sl.js';
import NormalizerSl from './normalizer-sl.js';
import SentimentSl from './sentiment/sentiment_sl.js';
import registerTrigrams from './trigrams.js';

class LangSl {
  register(container) {
    container.use(TokenizerSl);
    container.use(StemmerSl);
    container.use(StopwordsSl);
    container.use(NormalizerSl);
    container.register('sentiment-sl', SentimentSl);
    registerTrigrams(container);
  }
}

export default LangSl;
