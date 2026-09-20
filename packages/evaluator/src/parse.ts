import { parse as acornParse } from 'acorn';
import type { ParsedProgram } from './types.js';

/**
 * Parses a source string into an ESTree `Program`, the shape both `Evaluator`
 * and `JavascriptCompiler` walk.
 *
 * `acorn` requires the language version to be stated, where `esprima` had no
 * such option because it only ever understood ES2017. `latest` keeps the
 * parser in step with the syntax the runtime itself accepts.
 */
function parse(source: string): ParsedProgram {
  return acornParse(source, { ecmaVersion: 'latest' });
}

export default parse;
