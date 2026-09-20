import { defaultContainer, type Container } from './container.js';
import type {
  ContainerHolder,
  PipelineInput,
  Token,
  TokenMap,
} from './types.js';

class ObjToArr {
  declare container: Container;
  declare name: string;

  constructor(container: ContainerHolder = defaultContainer) {
    this.container = container.container || (container as Container);
    this.name = 'objToArr';
  }

  /** Takes the keys of a hashmap of tokens back into an array of tokens. */
  static objToArr(obj: TokenMap): Token[] {
    return Object.keys(obj);
  }

  run(input: TokenMap): Token[];
  run(input: PipelineInput): PipelineInput;
  run(input: TokenMap | PipelineInput): Token[] | PipelineInput {
    if (!input.tokens) {
      return ObjToArr.objToArr(input as TokenMap);
    }
    input.tokens = ObjToArr.objToArr(input.tokens as TokenMap);
    return input;
  }
}

export default ObjToArr;
