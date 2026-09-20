import { containerBootstrap } from '@nlpjs-neo/core';
import { ConsoleConnector } from '../src/index.js';

const container = containerBootstrap();

global.console = {
  warn: vi.fn<(...args: any[]) => void>(),
  log: vi.fn<(...args: any[]) => void>(),
} as unknown as Console;

describe('Console Connector', () => {
  describe('Constructor', () => {
    test('Constructor', () => {
      const connector = new ConsoleConnector(container);
      expect(connector).toBeDefined();
    });
  });

  describe('Say', () => {
    test('It should say an string', () => {
      console.log = vi.fn<(...args: any[]) => void>();
      const connector = new ConsoleConnector(container);
      connector.say('Hello world');
      expect(console.log).toHaveBeenCalledWith('bot> Hello world');
    });
  });
});
