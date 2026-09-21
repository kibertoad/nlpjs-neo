import { MemoryStorage } from '../src/index.js';

describe('Memory storage', () => {
  test('Does not partially save a batch with a later eTag conflict', async () => {
    const storage = new MemoryStorage();
    await storage.write({ a: { v: 1 } });

    await expect(
      storage.write({ b: { v: 1 }, a: { v: 2, eTag: 'wrong' } })
    ).rejects.toThrow('Error writing "a" due to eTag conflict.');

    await expect(storage.read(['a', 'b'])).resolves.toEqual({
      a: { v: 1, eTag: '1' },
    });
  });
});
