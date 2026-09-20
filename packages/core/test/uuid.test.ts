import uuid from '../src/uuid.js';

describe('uuid', () => {
  describe('uuid', () => {
    test('It should return a valid uuid', () => {
      const id = uuid();
      expect(id).toBeDefined();
      expect(id).toHaveLength(36);
      expect(id[8]).toEqual('-');
      expect(id[13]).toEqual('-');
      expect(id[18]).toEqual('-');
      expect(id[23]).toEqual('-');
    });
  });
});
