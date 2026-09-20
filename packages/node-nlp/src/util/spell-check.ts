import { SpellCheck as SpellCheckBase } from '@nlpjs-neo/similarity';

class SpellCheck extends SpellCheckBase {
  constructor(settings: any = {}) {
    super(settings.features ? settings : { features: settings });
  }
}

export { SpellCheck };
