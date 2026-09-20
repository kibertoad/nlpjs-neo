import {
  TokenizerEn,
  StemmerEn,
  StopwordsEn,
  NormalizerEn,
  registerTrigrams,
} from '@nlpjs-neo/lang-en-min';
import SentimentEn from './sentiment/sentiment_en.js';

class LangEn {
  register(container) {
    container.use(TokenizerEn);
    container.use(StemmerEn);
    container.use(StopwordsEn);
    container.use(NormalizerEn);
    container.register('sentiment-en', SentimentEn);
    registerTrigrams(container);
  }
}

export default LangEn;
