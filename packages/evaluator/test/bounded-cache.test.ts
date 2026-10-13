import BoundedCache from '../src/bounded-cache.js';

describe('BoundedCache', () => {
  describe('constructor', () => {
    it('Should refuse a capacity that is not a positive integer', () => {
      expect(() => new BoundedCache(0)).toThrow(RangeError);
      expect(() => new BoundedCache(-1)).toThrow(RangeError);
      expect(() => new BoundedCache(1.5)).toThrow(RangeError);
    });
  });

  describe('get and set', () => {
    it('Should answer the value of a key it holds', () => {
      const cache = new BoundedCache<string, number>(2);
      cache.set('a', 1);
      expect(cache.get('a')).toEqual(1);
    });
    it('Should answer undefined for a key it does not hold', () => {
      const cache = new BoundedCache<string, number>(2);
      expect(cache.get('a')).toBeUndefined();
    });
    it('Should replace the value of a key it already holds', () => {
      const cache = new BoundedCache<string, number>(2);
      cache.set('a', 1);
      cache.set('a', 2);
      expect(cache.get('a')).toEqual(2);
      expect(cache.size).toEqual(1);
    });
  });

  describe('eviction', () => {
    it('Should never hold more entries than its capacity', () => {
      const cache = new BoundedCache<number, number>(3);
      for (let i = 0; i < 100; i += 1) {
        cache.set(i, i);
      }
      expect(cache.size).toEqual(3);
      expect(cache.get(99)).toEqual(99);
      expect(cache.get(0)).toBeUndefined();
    });
    it('Should evict the entry that was used longest ago', () => {
      const cache = new BoundedCache<string, number>(2);
      cache.set('a', 1);
      cache.set('b', 2);
      // Reading 'a' leaves 'b' as the one used longest ago.
      expect(cache.get('a')).toEqual(1);
      cache.set('c', 3);
      expect(cache.get('b')).toBeUndefined();
      expect(cache.get('a')).toEqual(1);
      expect(cache.get('c')).toEqual(3);
    });
  });
});
