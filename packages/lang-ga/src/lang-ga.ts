import TokenizerGa from './tokenizer-ga.js';
import StemmerGa from './stemmer-ga.js';
import StopwordsGa from './stopwords-ga.js';
import NormalizerGa from './normalizer-ga.js';
import SentimentGa from './sentiment/sentiment_ga.js';

class LangGa {
  register(container) {
    container.use(TokenizerGa);
    container.use(StemmerGa);
    container.use(StopwordsGa);
    container.use(NormalizerGa);
    container.register('sentiment-ga', SentimentGa);
  }
}

export default LangGa;
