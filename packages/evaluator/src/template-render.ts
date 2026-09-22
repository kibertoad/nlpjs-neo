import Evaluator from './evaluator.js';
import type { Block, ExpressionBlock } from './template-parser.js';
import type { EvaluatedValue, EvaluationContext } from './types.js';

/**
 * What parsed blocks mean: the value an expression has, the items a section
 * repeats over, the context one of those items is rendered against, and the
 * text a value prints as.
 */

/** One evaluator serves every template: it keeps nothing between calls. */
const evaluator = new Evaluator();

/** Whether a value prints through a `toString` of its own. */
function hasOwnToString(value: object): boolean {
  const { toString } = value as { toString?: unknown };
  // An object made with `Object.create(null)` has no `toString` at all, and
  // `String()` on it throws, so it is printed as data like a plain object.
  return (
    typeof toString === 'function' && toString !== Object.prototype.toString
  );
}

/** JSON of a value, or its tag when it cannot be written as JSON. */
function toJson(value: object): string {
  try {
    const json = JSON.stringify(value, null, 2);
    return json === undefined ? Object.prototype.toString.call(value) : json;
  } catch {
    // Circular data, or a BigInt inside: a render never throws over printing.
    return Object.prototype.toString.call(value);
  }
}

/** Text of a value that is not an array. */
function stringifyValue(value: EvaluatedValue): string {
  if (value !== null && typeof value === 'object' && !hasOwnToString(value)) {
    return toJson(value);
  }
  return String(value);
}

/**
 * Text of an array: its items, each printed on its own, where `String(array)`
 * would print each one through its own `toString` and bring `[object Object]`
 * back. An empty item, and an array that holds itself, print nothing, which is
 * what `join` does as well.
 */
function stringifyArray(
  value: EvaluatedValue[],
  open: WeakSet<object>
): string {
  if (open.has(value)) {
    return '';
  }
  open.add(value);
  let result = '';
  for (let i = 0; i < value.length; i += 1) {
    if (i > 0) {
      result += ',';
    }
    const item = value[i];
    if (item !== null && item !== undefined) {
      result += Array.isArray(item)
        ? stringifyArray(item, open)
        : stringifyValue(item);
    }
  }
  open.delete(value);
  return result;
}

/**
 * Text of a value inside a string: an object is printed as JSON rather than as
 * `[object Object]`, and an array as its items, each printed the same way.
 */
export function stringify(value: EvaluatedValue): string {
  return Array.isArray(value)
    ? stringifyArray(value, new WeakSet())
    : stringifyValue(value);
}

/**
 * Value of an expression, or `undefined` when it has none, which leaves the
 * `{{ ... }}` in place as text.
 */
export function evaluateExpression(
  block: ExpressionBlock,
  context: EvaluationContext
): EvaluatedValue {
  const value = evaluator.evaluate(block.value, context);
  return value === null || value === undefined ? undefined : value;
}

/** The keys of an item that a section body reads directly, as `{{ name }}`. */
function itemKeys(item: EvaluatedValue): EvaluationContext {
  // Only an object has keys worth merging: spreading a string or an array
  // would add one entry per character or per index.
  return item !== null && typeof item === 'object' && !Array.isArray(item)
    ? item
    : {};
}

/** The context one repeated item is rendered against. */
export function createItemContext(
  item: EvaluatedValue,
  context: EvaluationContext,
  index: number
): EvaluationContext {
  return {
    ...itemKeys(item),
    _parent_: context,
    _current_: item,
    _index_: index,
  };
}

/**
 * The items a section or an `_iterator_` repeats over: the items of an array,
 * or the value itself when it is a single one. A value that is missing or
 * falsy repeats over nothing, so a section over it prints nothing instead of
 * its unresolved body.
 */
export function resolveItems(
  expression: string,
  context: EvaluationContext
): EvaluatedValue[] {
  const value = evaluator.evaluate(expression, context);
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : [];
}

/** Text a block prints. */
function renderBlock(block: Block, context: EvaluationContext): string {
  if (block.type === 'literal') {
    return block.text;
  }
  if (block.type === 'expression') {
    const value = evaluateExpression(block, context);
    return value === undefined ? block.text : stringify(value);
  }
  const items = resolveItems(block.value, context);
  let result = '';
  for (let i = 0; i < items.length; i += 1) {
    result += renderBlocks(
      block.blocks,
      createItemContext(items[i], context, i)
    );
  }
  return result;
}

/** Text a run of blocks prints, one after the other. */
function renderBlocks(blocks: Block[], context: EvaluationContext): string {
  let result = '';
  for (let i = 0; i < blocks.length; i += 1) {
    result += renderBlock(blocks[i], context);
  }
  return result;
}

export default renderBlocks;
