import TokenizerKo from './tokenizer-ko.js';
import StemmerKo from './stemmer-ko.js';
import StopwordsKo from './stopwords-ko.js';
import NormalizerKo from './normalizer-ko.js';
import SentimentKo from './sentiment/sentiment_ko.js';

class LangKo {
  register(container) {
    container.use(TokenizerKo);
    container.use(StemmerKo);
    container.use(StopwordsKo);
    container.use(NormalizerKo);
    container.register('sentiment-ko', SentimentKo);
  }
}

export default LangKo;
