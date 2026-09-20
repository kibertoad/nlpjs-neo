import { StopwordsId } from '@nlpjs-neo/lang-id';

class StopwordsMs extends StopwordsId {
  constructor(container, words) {
    super(container, words);
    this.name = 'stopwords-ms';
  }
}

export default StopwordsMs;
