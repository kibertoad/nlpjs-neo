import StemmerBn from './stemmer-bn.js';
import TokenizerBn from './tokenizer-bn.js';
import StopwordsBn from './stopwords-bn.js';
import NormalizerBn from './normalizer-bn.js';
import SentimentBn from './sentiment/sentiment_bn.js';

class LangBn {
  register(container) {
    container.use(StemmerBn);
    container.use(TokenizerBn);
    container.use(StopwordsBn);
    container.use(NormalizerBn);
    container.register('sentiment-bn', SentimentBn);
  }
}

export default LangBn;
