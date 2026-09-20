import compile from './compile.js';

class Template {
  compile(str, context) {
    return compile(str)(context);
  }
}

export default Template;
