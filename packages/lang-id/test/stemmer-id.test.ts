import { StemmerId } from '../src/index.js';

describe('Stemmer', () => {
  describe('Constructor', () => {
    test('It should create a new instance', () => {
      const instance = new StemmerId();
      expect(instance).toBeDefined();
    });
  });
});
