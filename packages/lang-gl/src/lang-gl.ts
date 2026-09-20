import TokenizerGl from './tokenizer-gl.js';
import StemmerGl from './stemmer-gl.js';
import StopwordsGl from './stopwords-gl.js';
import NormalizerGl from './normalizer-gl.js';
import SentimentGl from './sentiment/sentiment_gl.js';
import registerTrigrams from './trigrams.js';

class LangGl {
  register(container) {
    container.use(TokenizerGl);
    container.use(StemmerGl);
    container.use(StopwordsGl);
    container.use(NormalizerGl);
    container.register('sentiment-gl', SentimentGl);
    registerTrigrams(container);
  }
}

export default LangGl;
