import * as helpers from './helper.js';
import PythonParser from './python-parser.js';

/**
 * `with` is illegal in module code, which is always strict, and a direct
 * `eval` only sees the scope of the function it runs in. A function built with
 * the `Function` constructor is compiled as standalone sloppy-mode code, so the
 * scope wrapper is generated here: the Python helpers become parameters, which
 * puts them in the eval's scope, and `with` backs that scope with the context
 * so scripts can both read and assign context variables by name.
 */
const helperNames = Object.keys(helpers);
const helperValues = helperNames.map((name) => helpers[name]);
const evalInScope = new Function(
  ...helperNames,
  'js',
  'contextAsScope',
  'with (contextAsScope) { return eval(js); }'
);

function executePython(str, context: any = {}) {
  const transpiled = PythonParser.transpile(str);
  return evalInScope(...helperValues, transpiled, context);
}

export default executePython;
