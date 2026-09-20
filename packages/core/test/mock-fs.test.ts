import fs from '../src/mock-fs.js';

describe('mock fs', () => {
  describe('readFile', () => {
    test('Should return a Promise', () => {
      const actual = fs.readFile();
      expect(actual.then).toBeDefined();
      expect(typeof actual.then).toEqual('function');
    });
    test('It should resolve to undefined', async () => {
      const actual = await fs.readFile();
      expect(actual).toBeUndefined();
    });
  });

  describe('writeFile', () => {
    test('Should return a Promise', () => {
      const actual = fs.writeFile().catch(() => {}); // ignore rejection
      expect(actual.then).toBeDefined();
      expect(typeof actual.then).toEqual('function');
    });
    test('Should throw an Error', async () => {
      await expect(fs.writeFile()).rejects.toThrow(
        'File cannot be written in web'
      );
    });
  });

  describe('existsSync', () => {
    test('Should return false', () => {
      const actual = fs.existsSync();
      expect(actual).toBeFalsy();
    });
  });

  describe('lstatSync', () => {
    test('Should return undefined', () => {
      const actual = fs.lstatSync();
      expect(actual).toBeUndefined();
    });
  });

  describe('readFileSync', () => {
    test('Should return undefined', () => {
      const actual = fs.readFileSync();
      expect(actual).toBeUndefined();
    });
  });
});
