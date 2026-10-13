/**
 * A cache that never holds more than `capacity` entries: once it is full, the
 * entry that was read longest ago makes room for the new one.
 *
 * Anything keyed by text that a bot author or a user writes grows with
 * traffic, so a plain `Map` there is a leak that only shows in a long-lived
 * process. A miss and a stored `undefined` are not told apart, which suits a
 * cache of computed values.
 */
class BoundedCache<K, V> {
  private readonly entries = new Map<K, V>();
  private readonly capacity: number;

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new RangeError(
        `A cache capacity must be a positive integer, received ${capacity}`
      );
    }
    this.capacity = capacity;
  }

  /** How many entries are held right now. */
  get size(): number {
    return this.entries.size;
  }

  /** The value of `key`, which becomes the last one eviction will look at. */
  get(key: K): V | undefined {
    const value = this.entries.get(key);
    if (value === undefined) {
      return undefined;
    }
    // Re-inserting moves the key to the end of the iteration order, which is
    // where the most recently used entry belongs.
    this.entries.delete(key);
    this.entries.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    this.entries.delete(key);
    this.entries.set(key, value);
    if (this.entries.size > this.capacity) {
      const oldest = this.entries.keys().next();
      if (!oldest.done) {
        this.entries.delete(oldest.value);
      }
    }
  }
}

export default BoundedCache;
