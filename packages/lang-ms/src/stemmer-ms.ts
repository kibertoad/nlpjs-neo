import { StemmerId } from '@nlpjs-neo/lang-id';

class StemmerMs extends StemmerId {
  constructor(container?) {
    super(container);
    this.name = 'stemmer-ms';
  }
}

export default StemmerMs;
