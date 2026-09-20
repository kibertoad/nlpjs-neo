import TokenizerPl from './tokenizer-pl.js';
import StemmerPl from './stemmer-pl.js';
import StopwordsPl from './stopwords-pl.js';
import NormalizerPl from './normalizer-pl.js';
import SentimentPl from './sentiment/sentiment_pl.js';
import registerTrigrams from './trigrams.js';

class LangPl {
  register(container) {
    container.use(TokenizerPl);
    container.use(StemmerPl);
    container.use(StopwordsPl);
    container.use(NormalizerPl);
    container.register('sentiment-pl', SentimentPl);
    registerTrigrams(container);
  }
}

export default LangPl;
