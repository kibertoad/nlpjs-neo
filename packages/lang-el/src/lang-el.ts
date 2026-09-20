import TokenizerEl from './tokenizer-el.js';
import StemmerEl from './stemmer-el.js';
import StopwordsEl from './stopwords-el.js';
import NormalizerEl from './normalizer-el.js';
import SentimentEl from './sentiment/sentiment_el.js';

class LangEl {
  register(container) {
    container.use(TokenizerEl);
    container.use(StemmerEl);
    container.use(StopwordsEl);
    container.use(NormalizerEl);
    container.register('sentiment-el', SentimentEl);
  }
}

export default LangEl;
