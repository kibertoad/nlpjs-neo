import { defaultContainer } from './container.js';

class ObjToArr {
  declare container: any;
  declare name: any;

  constructor(container = defaultContainer) {
    this.container = container.container || container;
    this.name = 'objToArr';
  }

  static objToArr(obj) {
    return Object.keys(obj);
  }

  run(input) {
    if (!input.tokens) {
      return ObjToArr.objToArr(input);
    }
    input.tokens = ObjToArr.objToArr(input.tokens);
    return input;
  }
}

export default ObjToArr;
