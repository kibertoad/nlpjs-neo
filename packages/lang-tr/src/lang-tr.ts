import TokenizerTr from './tokenizer-tr.js';
import StemmerTr from './stemmer-tr.js';
import StopwordsTr from './stopwords-tr.js';
import NormalizerTr from './normalizer-tr.js';
import SentimentTr from './sentiment/sentiment_tr.js';
import registerTrigrams from './trigrams.js';

class LangTr {
  register(container) {
    container.use(TokenizerTr);
    container.use(StemmerTr);
    container.use(StopwordsTr);
    container.use(NormalizerTr);
    container.register('sentiment-tr', SentimentTr);
    registerTrigrams(container);
  }
}

export default LangTr;
