import dict from './dict.json' with { type: 'json' };
import namesDict from './names-dict.json' with { type: 'json' };
import { conjugate } from './korean-conjugation.js';

/**
 * What the dictionary knows about a word: the class it belongs to and, for a
 * conjugated verb, the form it conjugates from.
 */
interface DictionaryEntry {
  type: string;
  root?: string;
}

/** Every known word, conjugations included, keyed by the word itself. */
const dictionary: Record<string, DictionaryEntry> = {};
/** Known names per class (`Full`, `Given`, `Family`), as lookup sets. */
const names: Record<string, Record<string, number>> = {};
let initialized = false;

function build(): void {
  const entries = dict as Record<string, string[]>;
  const keys = Object.keys(entries);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const words = entries[key];
    for (let j = 0; j < words.length; j += 1) {
      dictionary[words[j]] = { type: key };
      if (key === 'Verb') {
        const conjugations = Object.keys(conjugate([words[j]], false));
        for (let k = 0; k < conjugations.length; k += 1) {
          if (conjugations[k] !== words[j]) {
            dictionary[conjugations[k]] = { type: key, root: words[j] };
          }
        }
      }
    }
  }
}

function buildNames(): void {
  const entries = namesDict as Record<string, string[]>;
  const keys = Object.keys(entries);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    names[key] = {};
    const words = entries[key];
    for (let j = 0; j < words.length; j += 1) {
      names[key][words[j]] = 1;
    }
  }
}

function initDicts(): void {
  if (!initialized) {
    build();
    buildNames();
    initialized = true;
  }
}

export { initDicts, dictionary, names };
export type { DictionaryEntry };
