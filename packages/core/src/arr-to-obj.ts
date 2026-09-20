import { defaultContainer } from './container.js';

/**
 * Plugin to convert an array to a hashmap where every item existing in the
 * array is mapped to a 1.
 */
class ArrToObj {
  declare container: any;
  declare name: any;

  /**
   * Constructor of the class
   * @param {object} container Parent container, if not defined then the
   *    default container is used.
   */
  constructor(container = defaultContainer) {
    this.container = container.container || container;
    this.name = 'arrToObj';
  }

  /**
   * Static method to convert an array to a hashmap object.
   * @param {object[]} arr Input array.
   * @returns {object} Output object.
   */
  static arrToObj(arr) {
    const result: any = {};
    for (let i = 0; i < arr.length; i += 1) {
      result[arr[i]] = 1;
    }
    return result;
  }

  run(input) {
    if (Array.isArray(input)) {
      return ArrToObj.arrToObj(input);
    }
    input.tokens = ArrToObj.arrToObj(input.tokens);
    return input;
  }
}

export default ArrToObj;
