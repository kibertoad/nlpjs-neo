import TokenizerPt from './tokenizer-pt.js';
import StemmerPt from './stemmer-pt.js';
import StopwordsPt from './stopwords-pt.js';
import NormalizerPt from './normalizer-pt.js';
import SentimentPt from './sentiment/sentiment_pt.js';
import registerTrigrams from './trigrams.js';

class LangPt {
  register(container) {
    container.use(TokenizerPt);
    container.use(StemmerPt);
    container.use(StopwordsPt);
    container.use(NormalizerPt);
    container.register('sentiment-pt', SentimentPt);
    registerTrigrams(container);
  }
}

export default LangPt;
