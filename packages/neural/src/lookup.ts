import type { CorpusEntry, SparseVector } from './types.js';

/**
 * Two way lookup between the terms of a corpus and the positions they take in
 * the vectors the network works with.
 */
class Lookup {
  /** Position of every known term. */
  declare dict: Map<string, number>;
  /** Known terms, by position. */
  declare items: string[];

  constructor(data?: CorpusEntry[], propName: 'input' | 'output' = 'input') {
    this.dict = new Map();
    this.items = [];
    if (data) {
      this.buildFromData(data, propName);
    }
  }

  add(key: string): void {
    if (!this.dict.has(key)) {
      this.dict.set(key, this.items.length);
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
    const resultValues: number[] = [];
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const id = this.dict.get(key);
      if (id !== undefined) {
        resultKeys.push(id);
        resultValues.push(item[key]);
      }
    }
    return {
      keys: resultKeys,
      values: resultValues,
    };
  }
}

export default Lookup;
