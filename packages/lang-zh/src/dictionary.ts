import { createRequire } from 'module';
import type { CedictEntry } from './types.js';

// The dictionary is ~9MB, so it is only pulled in when `start()` is called.
const require = createRequire(import.meta.url);

/** CC-CEDICT, indexed by both spellings of every word. */
export class Dictionary {
  /** Parsed lines, kept only while the dictionary is being compiled. */
  declare cache: Record<string, CedictEntry> | undefined;
  /** The raw dictionary, and the marker that it has been loaded. */
  declare cedict: string | undefined;
  declare simplified: Record<string, CedictEntry[]> | undefined;
  declare traditional: Record<string, CedictEntry[]> | undefined;

  getElement(line?: string): CedictEntry {
    if (!line) {
      return {
        traditional: '',
        simplified: '',
      };
    }
    if (this.cache[line]) {
      return this.cache[line];
    }
    const tokens = line.split(' ');
    const element = {
      traditional: tokens[0],
      simplified: tokens[1],
      pinyin: line.substring(line.indexOf('[') + 1, line.indexOf(']')),
      definition: line.substring(line.indexOf('/') + 1, line.lastIndexOf('/')),
    };
    this.cache[line] = element;
    return element;
  }

  /**
   * Reads the dictionary and indexes it, each on first use; a second call
   * does nothing.
   */
  start(): void {
    if (!this.cedict) {
      this.cedict = (
        require('./cedict_ts.u8.js') as { default: string }
      ).default;
    }
    if (!this.simplified) {
      console.log('Compiling dictionary');
      this.cache = {};
      this.simplified = {};
      this.traditional = {};
      const lines = this.cedict.split(/\r?\n/);
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (line && !line.startsWith('#')) {
          const current = this.getElement(line);
          const definitions = [current];
          let nextDefinition = this.getElement(lines[i + 1]);
          while (
            i + 1 < lines.length &&
            nextDefinition.traditional === current.traditional &&
            nextDefinition.simplified === current.simplified
          ) {
            i += 1;
            definitions.push(nextDefinition);
            nextDefinition = this.getElement(lines[i + 1]);
          }
          if (!this.simplified[current.simplified]) {
            this.simplified[current.simplified] = [];
          }
          for (let j = 0; j < definitions.length; j += 1) {
            this.simplified[current.simplified].push(definitions[j]);
          }
          if (!this.traditional[current.traditional]) {
            this.traditional[current.traditional] = [];
          }
          for (let j = 0; j < definitions.length; j += 1) {
            this.traditional[current.traditional].push(definitions[j]);
          }
        }
      }
      this.cache = undefined;
    }
  }

  search(word: string): CedictEntry[] | undefined {
    this.start();
    return this.simplified[word] || this.traditional[word];
  }

  /** Pinyin of every sense of a character; the character when unknown. */
  getPinyin(char: string): string[] | string {
    const definitions = this.search(char);
    return definitions ? definitions.map((x) => x.pinyin) : char;
  }

  /** The longest prefix of a text the dictionary knows, up to 8 characters. */
  getLongestMatch(text: string): string | undefined {
    const max = Math.min(8, text.length);
    for (let i = max; i >= 0; i -= 1) {
      const slice = text.substr(0, i);
      if (this.search(slice)) {
        return slice;
      }
    }
    return undefined;
  }

  /** Splits a text into the longest words the dictionary knows. */
  segment(text: string): string[] {
    const result: string[] = [];
    let pending = text;
    while (pending) {
      const seg = this.getLongestMatch(pending) || pending.substr(0, 1);
      result.push(seg);
      pending = pending.slice(seg.length);
    }
    return result;
  }
}

const instance = new Dictionary();
export default instance;
