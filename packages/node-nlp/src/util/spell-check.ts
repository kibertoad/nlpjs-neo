import { SpellCheck as SpellCheckBase } from '@nlpjs-neo/similarity';
import type { Features, SpellCheckSettings } from '@nlpjs-neo/similarity';

/**
 * Takes the features either wrapped in settings, as the base class does, or
 * on their own, which is how `node-nlp` has always been called.
 */
class SpellCheck extends SpellCheckBase {
  constructor(settings: SpellCheckSettings | Features = {}) {
    const wrapped = settings as SpellCheckSettings;
    super(wrapped.features ? wrapped : { features: settings as Features });
  }
}

export { SpellCheck };
