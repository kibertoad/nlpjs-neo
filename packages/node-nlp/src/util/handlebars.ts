import { compile } from '@nlpjs-neo/evaluator';

class Handlebars {
  static compile(str) {
    return compile(str);
  }
}

export { Handlebars };
