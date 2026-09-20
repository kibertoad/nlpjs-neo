import { defaultContainer, type Container } from './container.js';
import type {
  ContainerHolder,
  PipelineInput,
  Token,
  TokenMap,
} from './types.js';

/**
 * Plugin to convert an array to a hashmap where every item existing in the
 * array is mapped to a 1.
 */
class ArrToObj {
  declare container: Container;
  declare name: string;

  /**
   * Constructor of the class
   * @param {object} container Parent container, if not defined then the
   *    default container is used.
   */
  constructor(container: ContainerHolder = defaultContainer) {
    this.container = container.container || (container as Container);
    this.name = 'arrToObj';
  }

  /**
   * Static method to convert an array of tokens into a hashmap where every
   * token is mapped to a 1.
   */
  static arrToObj(arr: Token[]): TokenMap {
    const result: TokenMap = {};
    for (let i = 0; i < arr.length; i += 1) {
      result[arr[i]] = 1;
    }
    return result;
  }

  run(input: Token[]): TokenMap;
  run(input: PipelineInput): PipelineInput;
  run(input: Token[] | PipelineInput): TokenMap | PipelineInput {
    if (Array.isArray(input)) {
      return ArrToObj.arrToObj(input);
    }
    input.tokens = ArrToObj.arrToObj(input.tokens as Token[]);
    return input;
  }
}

export default ArrToObj;
