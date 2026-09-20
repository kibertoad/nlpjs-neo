/**
 * Class for an Among of a Stemmer
 */
class Among {
  declare instance: any;
  declare method: any;
  declare result: any;
  declare s: any;
  declare s_size: any;
  declare substring_i: any;

  constructor(s, sub, result, method?, instance?) {
    this.s_size = s.length;
    this.s = s;
    this.substring_i = sub;
    this.result = result;
    this.method = method;
    this.instance = instance;
  }
}

export default Among;
