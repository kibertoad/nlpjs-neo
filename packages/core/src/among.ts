/**
 * Guard invoked by a Snowball stemmer before it accepts an among. It receives
 * the stemmer that owns the table; the rule methods it calls are generated per
 * language, so the parameter stays open.
 */
export type AmongMethod = (instance: any) => unknown;

/**
 * Class for an Among of a Stemmer
 */
class Among {
  /** Stemmer the `method` guard is invoked on, when the table provides one. */
  declare instance: unknown;
  declare method: AmongMethod | undefined;
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
    method?: AmongMethod,
    instance?: unknown
  ) {
    this.s_size = s.length;
    this.s = s;
    this.substring_i = sub;
    this.result = result;
    this.method = method;
    this.instance = instance;
  }
}

export default Among;
