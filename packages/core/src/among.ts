import type BaseStemmer from './base-stemmer.js';

/**
 * Guard invoked by a Snowball stemmer before it accepts an among. It receives
 * the stemmer that owns the table and calls one of its rule methods, which are
 * generated per language: `TStemmer` is that language's stemmer.
 */
export type AmongMethod<TStemmer extends BaseStemmer = BaseStemmer> = (
  instance: TStemmer
) => unknown;

/**
 * Class for an Among of a Stemmer
 */
class Among<TStemmer extends BaseStemmer = BaseStemmer> {
  /** Stemmer the `method` guard is invoked on, when the table provides one. */
  declare instance: TStemmer | undefined;
  declare method: AmongMethod<TStemmer> | undefined;
  /** Value the stemmer returns when this among matches. */
  declare result: number;
  /** Literal this among matches. */
  declare s: string;
  declare s_size: number;
  /**
   * Index of the among holding the longest proper prefix of `s`, or -1 when
   * there is none. A few generated tables carry that prefix itself.
   */
  declare substring_i: number | string;

  constructor(
    s: string,
    sub: number | string,
    result: number,
    method?: AmongMethod<TStemmer>,
    instance?: TStemmer
  ) {
    this.s_size = s.length;
    this.s = s;
    this.substring_i = sub;
    this.result = result;
    this.method = method;
    this.instance = instance;
  }

  /**
   * A table of amongs written as text, which is how the generated stemmers
   * keep the long ones: entries separated by white space, each of them
   * `string,prefix,result` (the fields of the constructor).
   */
  static table<TStemmer extends BaseStemmer = BaseStemmer>(
    spec: string
  ): Among<TStemmer>[] {
    return spec
      .split(/\s+/)
      .filter(Boolean)
      .map((entry) => {
        const [s, sub, result] = entry.split(',');
        return new Among<TStemmer>(s, Number(sub), Number(result));
      });
  }
}

export default Among;
