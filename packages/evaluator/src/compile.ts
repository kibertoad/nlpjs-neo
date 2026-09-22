import getProgram from './template-parser.js';
import renderBlocks, {
  createItemContext,
  evaluateExpression,
  resolveItems,
} from './template-render.js';
import type { EvaluatedValue, EvaluationContext } from './types.js';

/** Key of an array item that asks to be repeated for each item of a context array. */
const iteratorName = '_iterator_';

/** How a string is turned into its result. */
export interface CompileOptions {
  /**
   * A string that is exactly one `{{ expression }}` answers the value of the
   * expression as it is, a number or an object included, instead of its text.
   * What that value is, is only known while it runs, so the result is typed
   * as `unknown` for the caller to name or to narrow.
   */
  native?: boolean;
}

/** Options that leave every string as text, so the result keeps the shape it was given. */
export type TextCompileOptions = CompileOptions & { native?: false };

function processString(
  str: string,
  context: EvaluationContext,
  options: CompileOptions
): unknown {
  const { blocks } = getProgram(str);
  const only = blocks.length === 1 ? blocks[0] : undefined;
  if (options.native && only !== undefined && only.type === 'expression') {
    const value = evaluateExpression(only, context);
    return value === undefined ? only.text : value;
  }
  return renderBlocks(blocks, context);
}

/**
 * The expression an item repeats over, when it asks to: `_iterator_: '#items'`
 * repeats the item for each item of `items`.
 */
function readIterator(item: unknown): string | undefined {
  if (item === null || typeof item !== 'object') {
    return undefined;
  }
  const iterator = (item as Record<string, unknown>)[iteratorName];
  return typeof iterator === 'string' && iterator.startsWith('#')
    ? iterator.slice(1)
    : undefined;
}

/** The item as it is repeated: everything it holds but the `_iterator_` itself. */
function withoutIterator(item: unknown): Record<string, unknown> {
  const source = item as Record<string, unknown>;
  const keys = Object.keys(source);
  const result: Record<string, unknown> = {};
  for (let i = 0; i < keys.length; i += 1) {
    if (keys[i] !== iteratorName) {
      result[keys[i]] = source[keys[i]];
    }
  }
  return result;
}

/** The values an array item stands for: itself, or one copy per item it repeats over. */
function expandItem(
  item: unknown,
  context: EvaluationContext,
  options: CompileOptions
): unknown[] {
  const iterator = readIterator(item);
  if (iterator === undefined) {
    return [process(item, context, options)];
  }
  const template = withoutIterator(item);
  return resolveItems(iterator, context).map((entry, index) =>
    process(template, createItemContext(entry, context, index), options)
  );
}

/**
 * Traverse the object replacing strings using context.
 * @param {object} obj Object to be replaced
 * @param {object} context Context variables
 * @param {object} options How a string is turned into its result.
 * @returns {object} Object traversed in deep replacing strings.
 */
function process(
  obj: unknown,
  context: EvaluationContext,
  options: CompileOptions
): unknown {
  if (typeof obj === 'string') {
    return processString(obj, context, options);
  }
  if (Array.isArray(obj)) {
    return obj.flatMap((item) => expandItem(item, context, options));
  }
  if (obj !== null && typeof obj === 'object') {
    const source = obj as Record<string, unknown>;
    const keys = Object.keys(source);
    const result: Record<string, unknown> = {};
    for (let i = 0; i < keys.length; i += 1) {
      result[keys[i]] = process(source[keys[i]], context, options);
    }
    return result;
  }
  return obj;
}

/**
 * Resolves the `{{ ... }}` expressions of a string, or of every string inside
 * an object or an array, against the context it is called with.
 *
 * The result keeps the shape it was given. With `native: true` a string can
 * answer a value of any type instead of text, so the result is only known
 * while it runs: name what you expect with `compile<Answer>(str, options)`, or
 * narrow the `unknown` it answers.
 */
function compile<T>(
  str: T,
  options?: TextCompileOptions
): (context?: EvaluationContext) => T;
function compile<TResult = unknown>(
  str: unknown,
  options: CompileOptions
): (context?: EvaluationContext) => TResult;
// The shape of the result belongs to the signatures above; the body answers
// whatever `process` made of the template.
function compile(
  str: unknown,
  options: CompileOptions = {}
): (context?: EvaluationContext) => EvaluatedValue {
  return (context: EvaluationContext = {}) => process(str, context, options);
}

export default compile;
