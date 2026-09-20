import TokenizerSv from './tokenizer-sv.js';
import StemmerSv from './stemmer-sv.js';
import StopwordsSv from './stopwords-sv.js';
import NormalizerSv from './normalizer-sv.js';
import SentimentSv from './sentiment/sentiment_sv.js';
import registerTrigrams from './trigrams.js';

class LangSv {
  register(container) {
    container.use(TokenizerSv);
    container.use(StemmerSv);
    container.use(StopwordsSv);
    container.use(NormalizerSv);
    container.register('sentiment-sv', SentimentSv);
    registerTrigrams(container);
  }
}

export default LangSv;
