import TokenizerEs from './tokenizer-es.js';
import StemmerEs from './stemmer-es.js';
import StopwordsEs from './stopwords-es.js';
import NormalizerEs from './normalizer-es.js';
import SentimentEs from './sentiment/sentiment_es.js';
import registerTrigrams from './trigrams.js';

class LangEs {
  register(container) {
    container.use(TokenizerEs);
    container.use(StemmerEs);
    container.use(StopwordsEs);
    container.use(NormalizerEs);
    container.register('sentiment-es', SentimentEs);
    registerTrigrams(container);
  }
}

export default LangEs;
