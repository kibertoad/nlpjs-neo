import deepEqual from '../src/deep-equal.js';

describe('Deep equal', () => {
  test('Primitives are equal when they are the same value', () => {
    expect(deepEqual('a', 'a')).toBeTruthy();
    expect(deepEqual('a', 'b')).toBeFalsy();
    expect(deepEqual(1, 1)).toBeTruthy();
    expect(deepEqual(1, '1')).toBeFalsy();
    expect(deepEqual(undefined, undefined)).toBeTruthy();
    expect(deepEqual(null, null)).toBeTruthy();
    expect(deepEqual(null, undefined)).toBeFalsy();
  });
  test('An object is not equal to a primitive', () => {
    expect(deepEqual({}, 'a')).toBeFalsy();
    expect(deepEqual(null, {})).toBeFalsy();
  });
  test('Key order does not decide identity', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBeTruthy();
  });
  test('Objects with different keys are not equal', () => {
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBeFalsy();
    expect(deepEqual({ a: 1 }, { b: 1 })).toBeFalsy();
  });
  test('Nested data is compared all the way down', () => {
    expect(
      deepEqual({ a: { b: [1, { c: 2 }] } }, { a: { b: [1, { c: 2 }] } })
    ).toBeTruthy();
    expect(
      deepEqual({ a: { b: [1, { c: 2 }] } }, { a: { b: [1, { c: 3 }] } })
    ).toBeFalsy();
  });
  test('Arrays are compared by position and length', () => {
    expect(deepEqual([1, 2], [1, 2])).toBeTruthy();
    expect(deepEqual([1, 2], [2, 1])).toBeFalsy();
    expect(deepEqual([1, 2], [1, 2, 3])).toBeFalsy();
  });
  test('An array is not equal to an object', () => {
    expect(deepEqual([], {})).toBeFalsy();
    expect(deepEqual({ 0: 'a', length: 1 }, ['a'])).toBeFalsy();
  });
  test('Dates are compared by the instant they hold', () => {
    expect(deepEqual(new Date(0), new Date(0))).toBeTruthy();
    expect(deepEqual(new Date(0), new Date(1))).toBeFalsy();
    expect(deepEqual(new Date(0), {})).toBeFalsy();
  });
  test('Data that refers back to itself is compared without looping', () => {
    const a: Record<string, unknown> = { type: 'card' };
    a.self = a;
    const b: Record<string, unknown> = { type: 'card' };
    b.self = b;
    expect(deepEqual(a, b)).toBeTruthy();
    const c: Record<string, unknown> = { type: 'other' };
    c.self = c;
    expect(deepEqual(a, c)).toBeFalsy();
  });
});
