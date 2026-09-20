import TokenizerRu from './tokenizer-ru.js';
import StemmerRu from './stemmer-ru.js';
import StopwordsRu from './stopwords-ru.js';
import NormalizerRu from './normalizer-ru.js';
import SentimentRu from './sentiment/sentiment_ru.js';
import registerTrigrams from './trigrams.js';

class LangRu {
  register(container) {
    container.use(TokenizerRu);
    container.use(StemmerRu);
    container.use(StopwordsRu);
    container.use(NormalizerRu);
    container.register('sentiment-ru', SentimentRu);
    registerTrigrams(container);
  }
}

export default LangRu;
