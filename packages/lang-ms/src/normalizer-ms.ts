import { NormalizerId } from '@nlpjs-neo/lang-id';

class NormalizerMs extends NormalizerId {
  constructor(container) {
    super(container);
    this.name = 'normalizer-ms';
  }
}

export default NormalizerMs;
