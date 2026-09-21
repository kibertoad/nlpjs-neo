import type { ContainerHolder } from '@nlpjs-neo/core';
import dictionary from './dictionary-es.json' with { type: 'json' };
import SnowballStemmerEs from './stemmer-es.generated.js';

/**
 * The Spanish stemmer. The algorithm is the Snowball one with the changes that
 * are marked in `tools/snowball/algorithms/spanish.sbl`, generated into
 * `stemmer-es.generated.ts`. What this class adds is the dictionary of words
 * that are answered without the algorithm, and the two steps around it: the
 * pronouns are taken off the infinitives before, and the ending of the stem is
 * tidied after.
 */
class StemmerEs extends SnowballStemmerEs {
  constructor(container?: ContainerHolder) {
    super(container);
    this.dictionary = dictionary;
  }

  innerStem(): boolean {
    const current = this.getCurrent();
    if (current.endsWith('rme')) {
      this.setCurrent(current.slice(0, -2));
    } else if (current.endsWith('rte')) {
      this.setCurrent(current.slice(0, -2));
    } else if (current.endsWith('rse')) {
      this.setCurrent(current.slice(0, -2));
    } else if (current.endsWith('rnos')) {
      this.setCurrent(current.slice(0, -3));
    }
    const stemmed = super.innerStem();
    const b = current;
    const a = this.getCurrent();
    if (a.length > 4) {
      if (a === b) {
        if (a.endsWith('s') || a.endsWith('i')) {
          this.setCurrent(a.slice(0, -1));
        }
      } else if (a.endsWith('zc') || a.endsWith('qu')) {
        this.setCurrent(`${a.slice(0, -2)}c`);
      } else if (a.endsWith('z')) {
        this.setCurrent(`${a.slice(0, -1)}c`);
      } else if (a.endsWith('i')) {
        this.setCurrent(`${a.slice(0, -1)}`);
      }
    }
    if (a.length <= 4) {
      if (a.endsWith('z')) {
        this.setCurrent(`${a.slice(0, -1)}c`);
      }
    }
    return stemmed;
  }
}

export default StemmerEs;
