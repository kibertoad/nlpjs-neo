import { generate as unparse } from 'astring';

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

function createScopedFunction(node, context, excludedKeys: string[] = []) {
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
    `"use strict"; return ${unparse(node)}`
  ).apply(undefined, values.concat(blockedValues));
}

export default createScopedFunction;
