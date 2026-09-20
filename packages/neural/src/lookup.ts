import type { CorpusEntry, SparseVector } from './types.js';

/**
 * Two way lookup between the terms of a corpus and the positions they take in
 * the vectors the network works with.
 */
class Lookup {
  /** Position of every known term. */
  declare dict: Record<string, number>;
  /** Known terms, by position. */
  declare items: string[];

  constructor(data?: CorpusEntry[], propName: 'input' | 'output' = 'input') {
    this.dict = {};
    this.items = [];
    if (data) {
      this.buildFromData(data, propName);
    }
  }

  add(key: string): void {
    if (this.dict[key] === undefined) {
      this.dict[key] = this.items.length;
      this.items.push(key);
    }
  }

  buildFromData(data: CorpusEntry[], propName: 'input' | 'output'): void {
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i][propName];
      const keys = Object.keys(item);
      for (let j = 0; j < keys.length; j += 1) {
        this.add(keys[j]);
      }
    }
  }

  /** Translates a map of terms into a vector, dropping unknown terms. */
  prepare(item: Record<string, number>): SparseVector {
    const keys = Object.keys(item);
    const resultKeys: number[] = [];
    const resultData: Record<number, number> = {};
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (this.dict[key] !== undefined) {
        resultKeys.push(this.dict[key]);
        resultData[this.dict[key]] = item[key];
      }
    }
    return {
      keys: resultKeys,
      data: resultData,
    };
  }
}

export default Lookup;
