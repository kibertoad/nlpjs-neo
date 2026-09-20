import Evaluator from './evaluator.js';

const evaluator = new Evaluator();

const dictionary: any = {};

/**
 * Process a string using a dictionary to don't repeat the regex match.
 * @param {string} str String to be processed.
 * @param {object[]} context Context with the variables to be replaced.
 * @returns {string} String processed with context variables replaced.
 */
function processString(str, context) {
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
function process(obj, context?, _utterance?, _arg3?) {
  if (typeof obj === 'string') {
    return processString(obj, context);
  }
  if (Array.isArray(obj)) {
    return obj.map((x) => process(x, context));
  }
  if (obj !== null && typeof obj === 'object') {
    const keys = Object.keys(obj);
    const result: any = {};
    for (let i = 0; i < keys.length; i += 1) {
      result[keys[i]] = process(obj[keys[i]], context);
    }
    return result;
  }
  return obj;
}

function compile(str) {
  return (context: any = {}) => process(str, context);
}

export default compile;
