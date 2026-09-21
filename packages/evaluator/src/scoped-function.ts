import type { Node } from 'acorn';

const HOST_GLOBAL_NAMES = [
  'process',
  'global',
  'globalThis',
  'window',
  'self',
  'document',
  'navigator',
  'location',
  'Buffer',
  'require',
  'module',
  'exports',
  '__dirname',
  '__filename',
  'Function',
  'console',
  'fetch',
  'setImmediate',
  'setInterval',
  'setTimeout',
  'queueMicrotask',
];

/**
 * Source text of a node. `parse` puts the source on every node it produces, and
 * the text is what the author wrote, so nothing is regenerated.
 */
function sourceOf(node: Node): string {
  const { sourceFile } = node as Node & { sourceFile?: string };
  if (sourceFile === undefined) {
    throw new Error('The node was not produced by the evaluator parser');
  }
  return sourceFile.slice(node.start, node.end);
}

function createScopedFunction(
  node: Node,
  context: Record<string, unknown>,
  excludedKeys: string[] = []
): unknown {
  const keys = Object.keys(context).filter(
    (key) => !excludedKeys.includes(key)
  );
  const blockedNames = HOST_GLOBAL_NAMES.filter((name) => !keys.includes(name));
  const values = keys.map((key) => context[key]);
  const blockedValues = blockedNames.map(() => undefined);

  // Function expressions are still generated for compatibility with native
  // callbacks, but the generated lexical environment cannot resolve host
  // globals. Strict mode also keeps an unbound `this` from becoming global.
  // oxlint-disable-next-line
  return Function(
    keys.concat(blockedNames).join(', '),
    `"use strict"; return ${sourceOf(node)}`
  ).apply(undefined, values.concat(blockedValues));
}

export default createScopedFunction;
