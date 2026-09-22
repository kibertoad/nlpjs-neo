/**
 * Structural equality for the JSON shaped data an answer and its options are
 * made of. `JSON.stringify` cannot stand in for this: it makes key order part
 * of identity, so the same card declared as `{ type, options }` and as
 * `{ options, type }` would count as two different answers, and it throws on
 * a payload that refers back to itself.
 */

/**
 * Pairs already being compared further up the recursion. A payload that
 * refers back to itself is equal to another one that refers back to itself in
 * the same place, so revisiting a pair means the two sides have matched all
 * the way around the cycle.
 */
type SeenPairs = Map<object, Set<object>>;

function sameKeys(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  seen: SeenPairs
): boolean {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) {
    return false;
  }
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
    if (!deepEqual(a[key], b[key], seen)) {
      return false;
    }
  }
  return true;
}

function sameItems(a: unknown[], b: unknown[], seen: SeenPairs): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (!deepEqual(a[i], b[i], seen)) {
      return false;
    }
  }
  return true;
}

/** Whether two values hold the same data, whatever order their keys are in. */
function deepEqual(
  a: unknown,
  b: unknown,
  seen: SeenPairs = new Map()
): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }
  if (a instanceof Date || b instanceof Date) {
    return (
      a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
    );
  }
  const isArray = Array.isArray(a);
  if (isArray !== Array.isArray(b)) {
    return false;
  }
  let pairs = seen.get(a);
  if (pairs) {
    if (pairs.has(b)) {
      return true;
    }
  } else {
    pairs = new Set();
    seen.set(a, pairs);
  }
  pairs.add(b);
  return isArray
    ? sameItems(a as unknown[], b as unknown[], seen)
    : sameKeys(
        a as Record<string, unknown>,
        b as Record<string, unknown>,
        seen
      );
}

export default deepEqual;
