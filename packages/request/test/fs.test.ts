import { fs } from '../src/index.js';

describe('fs', () => {
  describe('readFile', () => {
    test('It can read one file', async () => {
      const actual = await fs.readFile('./packages/request/test/file.txt');
      expect(actual).toEqual('something');
    });
  });

  describe('readFileSync', () => {
    test('It can read one file sync', () => {
      const actual = fs.readFileSync('./packages/request/test/file.txt');
      expect(actual).toEqual('something');
    });
  });

  describe('existsSync', () => {
    test('It should return true if the file exists', () => {
      const actual = fs.existsSync('./packages/request/test/file.txt');
      expect(actual).toBeTruthy();
    });
    test('It should return true if the file do not exists', () => {
      const actual = fs.existsSync('./packages/request/test/file2.txt');
      expect(actual).toBeFalsy();
    });
  });

  describe('lstatSync', () => {
    test('It should return a valid lstat object', () => {
      const actual = fs.lstatSync('./packages/request/test/file.txt');
      expect(actual).toBeDefined();
      expect(actual.isDirectory()).toBeFalsy();
      expect(actual.isFile).toBeTruthy();
    });
  });

  describe('writeFile', () => {
    test('Should return a Promise', () => {
      const actual = fs.writeFile().catch(() => {}); // ignore rejection
      expect(actual.then).toBeDefined();
      expect(typeof actual.then).toEqual('function');
    });
    test('Should throw an Error', async () => {
      await expect(fs.writeFile('https://wwww.something.com')).rejects.toThrow(
        'File cannot be written in web'
      );
    });
  });
});
