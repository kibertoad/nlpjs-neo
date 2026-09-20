import Evaluator from './evaluator.js';
import type { EvaluationContext } from './types.js';

const evaluator = new Evaluator();

/** Template expressions of a string, keyed by the string, so it is matched once. */
const dictionary: Record<string, string[]> = {};

/**
 * Process a string using a dictionary to don't repeat the regex match.
 * @param {string} str String to be processed.
 * @param {object[]} context Context with the variables to be replaced.
 * @returns {string} String processed with context variables replaced.
 */
function processString(str: string, context?: EvaluationContext): string {
  if (dictionary[str] === undefined) {
    dictionary[str] = str.match(/{{\s*([^}]+)\s*}}/g) || [];
  }
  const matches = dictionary[str];
  return matches.reduce((p, c) => {
    const solution = evaluator.evaluate(c.substr(2, c.length - 4), context);
    return solution !== null && solution !== undefined
      ? p.replace(c, solution)
      : p;
  }, str);
}

/**
 * Traverse the object replacing strings using context.
 * @param {object} obj Object to be replaced
 * @param {object} context Context variables
 * @returns {object} Object traversed in deep replacing strings.
 */
function process<T>(
  obj: T,
  context?: EvaluationContext,
  _utterance?: unknown,
  _arg3?: unknown
): T {
  if (typeof obj === 'string') {
    return processString(obj, context) as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((x) => process(x, context)) as T;
  }
  if (obj !== null && typeof obj === 'object') {
    const source = obj as Record<string, unknown>;
    const keys = Object.keys(source);
    const result: Record<string, unknown> = {};
    for (let i = 0; i < keys.length; i += 1) {
      result[keys[i]] = process(source[keys[i]], context);
    }
    return result as T;
  }
  return obj;
}

function compile<T>(str: T): (context?: EvaluationContext) => T {
  return (context: EvaluationContext = {}) => process(str, context);
}

export default compile;
