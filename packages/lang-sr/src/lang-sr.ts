import TokenizerSr from './tokenizer-sr.js';
import StemmerSr from './stemmer-sr.js';
import StopwordsSr from './stopwords-sr.js';
import NormalizerSr from './normalizer-sr.js';
import SentimentSr from './sentiment/sentiment_sr.js';

class LangSr {
  register(container) {
    container.use(TokenizerSr);
    container.use(StemmerSr);
    container.use(StopwordsSr);
    container.use(NormalizerSr);
    container.register('sentiment-sr', SentimentSr);
  }
}

export default LangSr;
