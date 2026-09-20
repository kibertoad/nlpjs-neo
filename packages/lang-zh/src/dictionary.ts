import { createRequire } from 'module';

// The dictionary is ~9MB, so it is only pulled in when `start()` is called.
const require = createRequire(import.meta.url);

class Dictionary {
  declare cache: any;
  declare cedict: any;
  declare simplified: any;
  declare traditional: any;

  getElement(line) {
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

  start() {
    if (!this.cedict) {
      this.cedict = require('./cedict_ts.u8.js').default;
      console.log('Compiling dictionary');
      this.cache = {};
      this.simplified = {};
      this.traditional = {};
      const lines = this.cedict.split(/\r?\n/);
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (!line.startsWith('#')) {
          const current = this.getElement(line);
          const definitions = [current];
          let nextDefinition = this.getElement(lines[i + 1]);
          while (
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

  search(word) {
    this.start();
    return this.simplified[word] || this.traditional[word];
  }

  getPinyin(char) {
    const definitions = this.search(char);
    return definitions ? definitions.map((x) => x.pinyin) : char;
  }

  getLongestMatch(text) {
    const max = Math.min(8, text.length);
    for (let i = max; i >= 0; i -= 1) {
      const slice = text.substr(0, i);
      if (this.search(slice)) {
        return slice;
      }
    }
    return undefined;
  }

  segment(text) {
    const result: any[] = [];
    while (text) {
      const seg = this.getLongestMatch(text) || text.substr(0, 1);
      result.push(seg);
      text = text.slice(seg.length);
    }
    return result;
  }
}

const instance = new Dictionary();
export default instance;
