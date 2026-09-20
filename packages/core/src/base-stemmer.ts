import { defaultContainer, type Container } from './container.js';
import Tokenizer from './tokenizer.js';
import type Among from './among.js';
import type {
  ContainerHolder,
  PipelineInput,
  StemmerDictionary,
  StopwordsService,
  Token,
  TokenizerService,
} from './types.js';

/* oxlint-disable */
/**
 * Runtime the generated Snowball stemmers are compiled against: a cursor over
 * `current`, the grouping and among primitives their rules call, and the
 * caching `stemWord`/`stemWords` entry points on top.
 *
 * The rule methods themselves are emitted per language, so only the state and
 * the primitives live here. Every field is a Snowball register: `bra` and
 * `ket` mark the slice the current rule replaces, `limit_backward` the point
 * a backwards rule may not pass.
 */
class BaseStemmer {
  declare bra: number;
  /** Stemmed form per word, keyed by `.<word>` so no word hits `Object` keys. */
  declare cache: Record<string, string>;
  declare container: Container;
  /** Word being stemmed, rewritten in place by the slice primitives. */
  declare current: string;
  declare cursor: number;
  declare dictionary: StemmerDictionary;
  declare ket: number;
  declare limit: number;
  declare limit_backward: number;
  declare name: string;
  declare stopwords: StopwordsService | undefined;
  declare tokenizer: TokenizerService | undefined;

  constructor(
    container: ContainerHolder = defaultContainer,
    dictionary?: StemmerDictionary
  ) {
    this.container =
      (container as { container?: Container }).container ||
      (container as Container);
    this.cache = {};
    this.setCurrent('');
    this.dictionary = dictionary || { before: {}, after: {} };
  }

  /**
   * Copies the cursor state of another stemmer. The generated Snowball
   * stemmers chain up to this through `super.copy_from(other)`.
   */
  copy_from(other: BaseStemmer): void {
    this.current = other.current;
    this.cursor = other.cursor;
    this.limit = other.limit;
    this.limit_backward = other.limit_backward;
    this.bra = other.bra;
    this.ket = other.ket;
  }

  /**
   * Language specific stemming step, implemented by each generated stemmer.
   */
  /**
   * The generated stemmers return whether their rules applied; the hand
   * written ones rewrite `current` and return nothing. `stemWord` reads
   * `current` either way, so the result is not part of the contract.
   */
  innerStem(): unknown {
    throw new Error('This method should be implemented by child classes');
  }

  setCurrent(value: string): void {
    this.current = value;
    this.cursor = 0;
    this.limit = this.current.length;
    this.limit_backward = 0;
    this.bra = this.cursor;
    this.ket = this.limit;
  }

  getCurrent(): string {
    return this.current;
  }

  /** Tests one character against a grouping table: `true` when it is absent. */
  bc(s: number[], ch: number): boolean {
    if ((s[ch >>> 3] & (0x1 << (ch & 0x7))) == 0) {
      return true;
    }
    return false;
  }

  in_grouping(s: number[], min: number, max: number): boolean {
    if (this.cursor >= this.limit) return false;
    let ch = this.current.charCodeAt(this.cursor);
    if (ch > max || ch < min) return false;
    ch -= min;
    if (this.bc(s, ch)) return false;
    this.cursor++;
    return true;
  }

  in_grouping_b(s: number[], min: number, max: number): boolean {
    if (this.cursor <= this.limit_backward) return false;
    let ch = this.current.charCodeAt(this.cursor - 1);
    if (ch > max || ch < min) return false;
    ch -= min;
    if (this.bc(s, ch)) return false;
    this.cursor--;
    return true;
  }

  out_grouping(s: number[], min: number, max: number): boolean {
    if (this.cursor >= this.limit) return false;
    let ch = this.current.charCodeAt(this.cursor);
    if (ch > max || ch < min) {
      this.cursor++;
      return true;
    }
    ch -= min;
    if (this.bc(s, ch)) {
      this.cursor++;
      return true;
    }
    return false;
  }

  out_grouping_b(s: number[], min: number, max: number): boolean {
    if (this.cursor <= this.limit_backward) return false;
    let ch = this.current.charCodeAt(this.cursor - 1);
    if (ch > max || ch < min) {
      this.cursor--;
      return true;
    }
    ch -= min;
    if (this.bc(s, ch)) {
      this.cursor--;
      return true;
    }
    return false;
  }

  eq_s(s_size: number | string, s?: string): boolean {
    if (typeof s_size === 'string') {
      s = s_size;
      s_size = s.length;
    }
    if (
      this.limit - this.cursor < s_size ||
      this.current.slice(this.cursor, this.cursor + s_size) != s
    ) {
      return false;
    }
    this.cursor += s_size;
    return true;
  }

  eq_s_b(s_size: number | string, s?: string): boolean {
    if (typeof s_size === 'string') {
      s = s_size;
      s_size = s.length;
    }
    if (
      this.cursor - this.limit_backward < s_size ||
      this.current.slice(this.cursor - s_size, this.cursor) != s
    ) {
      return false;
    }
    this.cursor -= s_size;
    return true;
  }

  find_among(v: Among[], v_size?: number): number {
    let i = 0;
    let j = v_size || v.length;

    const c = this.cursor;
    const l = this.limit;

    let common_i = 0;
    let common_j = 0;

    let first_key_inspected = false;

    while (true) {
      const k = i + ((j - i) >>> 1);
      let diff = 0;
      let common = common_i < common_j ? common_i : common_j; // smaller
      var w = v[k];
      var i2;
      for (i2 = common; i2 < w.s_size; i2++) {
        if (c + common == l) {
          diff = -1;
          break;
        }
        diff = this.current.charCodeAt(c + common) - w.s.charCodeAt(i2);
        if (diff != 0) break;
        common++;
      }
      if (diff < 0) {
        j = k;
        common_j = common;
      } else {
        i = k;
        common_i = common;
      }
      if (j - i <= 1) {
        if (i > 0) break; // v->s has been inspected
        if (j == i) break; // only one item in v

        // - but now we need to go round once more to get
        // v->s inspected. This looks messy, but is actually
        // the optimal approach.

        if (first_key_inspected) break;
        first_key_inspected = true;
      }
    }
    while (true) {
      var w = v[i];
      if (common_i >= w.s_size) {
        this.cursor = c + w.s_size;
        if (w.method == null) {
          return w.result;
        }
        const res = w.method(w.instance);
        this.cursor = c + w.s_size;
        if (res) {
          return w.result;
        }
      }
      // `substring_i` is the index of the longest proper prefix. The one
      // table that stores that prefix as a string (the Spanish `a_8`) is only
      // ever walked by its own tree based lookup, never by this search.
      i = w.substring_i as number;
      if (i < 0) return 0;
    }
    return -1; // not reachable
  }

  // find_among_b is for backwards processing. Same comments apply
  find_among_b(v: Among[], v_size?: number): number {
    let i = 0;
    let j = v_size || v.length;

    const c = this.cursor;
    const lb = this.limit_backward;

    let common_i = 0;
    let common_j = 0;

    let first_key_inspected = false;

    while (true) {
      const k = i + ((j - i) >> 1);
      let diff = 0;
      let common = common_i < common_j ? common_i : common_j;
      var w = v[k];
      var i2;
      for (i2 = w.s_size - 1 - common; i2 >= 0; i2--) {
        if (c - common == lb) {
          diff = -1;
          break;
        }
        diff = this.current.charCodeAt(c - 1 - common) - w.s.charCodeAt(i2);
        if (diff != 0) break;
        common++;
      }
      if (diff < 0) {
        j = k;
        common_j = common;
      } else {
        i = k;
        common_i = common;
      }
      if (j - i <= 1) {
        if (i > 0) break;
        if (j == i) break;
        if (first_key_inspected) break;
        first_key_inspected = true;
      }
    }
    while (true) {
      var w = v[i];
      if (common_i >= w.s_size) {
        this.cursor = c - w.s_size;
        if (w.method == null) return w.result;
        const res = w.method(this);
        this.cursor = c - w.s_size;
        if (res) return w.result;
      }
      // `substring_i` is the index of the longest proper prefix. The one
      // table that stores that prefix as a string (the Spanish `a_8`) is only
      // ever walked by its own tree based lookup, never by this search.
      i = w.substring_i as number;
      if (i < 0) return 0;
    }
    return -1; // not reachable
  }

  /* to replace chars between c_bra and c_ket in this.current by the
   * chars in s.
   */
  replace_s(c_bra: number, c_ket: number, s: string): number {
    const adjustment = s.length - (c_ket - c_bra);
    this.current = this.current.slice(0, c_bra) + s + this.current.slice(c_ket);
    this.limit += adjustment;
    if (this.cursor >= c_ket) this.cursor += adjustment;
    else if (this.cursor > c_bra) this.cursor = c_bra;
    return adjustment;
  }

  slice_check(): boolean {
    if (
      this.bra < 0 ||
      this.bra > this.ket ||
      this.ket > this.limit ||
      this.limit > this.current.length
    ) {
      return false;
    }
    return true;
  }

  slice_from(s: string): boolean {
    if (this.slice_check()) {
      this.replace_s(this.bra, this.ket, s);
      return true;
    }
    return false;
  }

  slice_del(): boolean {
    return this.slice_from('');
  }

  insert(c_bra: number, c_ket: number, s: string): void {
    const adjustment = this.replace_s(c_bra, c_ket, s);
    if (c_bra <= this.bra) this.bra += adjustment;
    if (c_bra <= this.ket) this.ket += adjustment;
  }

  /* Copy the slice into the supplied StringBuffer */
  slice_to(s?: string): string {
    let result = '';
    if (this.slice_check()) {
      result = this.current.slice(this.bra, this.ket);
    }
    return result;
  }

  stemWord(word: Token): Token {
    let result = this.cache[`.${word}`];
    if (result == null) {
      if (this.dictionary.before.hasOwnProperty(word)) {
        result = this.dictionary.before[word];
      } else {
        this.setCurrent(word);
        this.innerStem();
        result = this.getCurrent();
        if (this.dictionary.after.hasOwnProperty(result)) {
          result = this.dictionary.after[result];
        }
      }
      this.cache[`.${word}`] = result;
    }
    return result;
  }

  stemWords(words: Token[]): Token[] {
    const results: Token[] = [];
    for (let i = 0; i < words.length; i++) {
      const stemmed = this.stemWord(words[i]);
      if (stemmed) {
        results.push(stemmed.trim());
      }
    }
    return results;
  }

  /**
   * Stems one token or a list of them. The single token form is what the
   * language packages call directly; the pipeline always passes a list.
   *
   * Languages whose stemmer runs on an asynchronous tokenizer -- Japanese,
   * Korean -- replace this with a promise returning form, hence the union.
   */
  stem(
    tokens: Token | Token[] | undefined,
    input?: PipelineInput
  ): Token | Token[] | Promise<Token[]> | undefined {
    if (tokens === undefined || tokens === null) {
      return tokens;
    }
    if (!Array.isArray(tokens)) {
      return this.stemWords([tokens])[0];
    }
    return this.stemWords(tokens);
  }

  getTokenizer(): TokenizerService {
    if (!this.tokenizer) {
      this.tokenizer =
        this.container.get<TokenizerService>(
          `tokenizer-${this.name.slice(-2)}`
        ) || new Tokenizer();
    }
    return this.tokenizer;
  }

  getStopwords(): StopwordsService | undefined {
    if (!this.stopwords) {
      this.stopwords = this.container.get<StopwordsService>(
        `stopwords-${this.name.slice(-2)}`
      );
    }
    return this.stopwords;
  }

  tokenizeAndStem(text: string, keepStops = true): Token[] {
    const tokenizer = this.getTokenizer();
    let tokens = tokenizer.tokenize(text, true) as Token[];
    if (!keepStops) {
      const stopwords = this.getStopwords();
      if (stopwords) {
        tokens = stopwords.removeStopwords(tokens);
      }
    }
    return this.stemWords(tokens);
  }
}

export default BaseStemmer;
