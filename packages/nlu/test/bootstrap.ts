import { containerBootstrap } from '@nlpjs-neo/core';
import { NluNeural } from '../src/index.js';

class OtherNlu extends NluNeural {
  registerDefault() {
    super.registerDefault();
    this.container.register('OtherNlu', OtherNlu, false);
  }
}

const container = containerBootstrap();
container.use(NluNeural);
container.use(OtherNlu);

export default container;
