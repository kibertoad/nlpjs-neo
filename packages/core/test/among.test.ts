import { Among } from '../src/index.js';

describe('Among', () => {
  describe('table', () => {
    test('It should read the entries of a table written as text', () => {
      const table = Among.table(`
        ing,-1,1 ed,-1,2
        ling,0,1
      `);
      expect(table).toHaveLength(3);
      expect(
        table.map((among) => [among.s, among.substring_i, among.result])
      ).toEqual([
        ['ing', -1, 1],
        ['ed', -1, 2],
        ['ling', 0, 1],
      ]);
      expect(table[2].s_size).toBe(4);
      expect(table[0].method).toBeUndefined();
    });

    test('It should read an empty table', () => {
      expect(Among.table('')).toEqual([]);
    });
  });
});
