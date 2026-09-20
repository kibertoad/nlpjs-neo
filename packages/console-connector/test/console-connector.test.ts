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

  describe('Hear', () => {
    test('It waits for the hear pipeline', async () => {
      const testContainer = containerBootstrap();
      const pipeline = {};
      const runPipeline = vi.fn().mockResolvedValue(undefined);
      vi.spyOn(testContainer, 'getPipeline').mockReturnValue(pipeline);
      vi.spyOn(testContainer, 'runPipeline').mockImplementation(runPipeline);
      const connector = new ConsoleConnector(testContainer);

      await connector.hear('Hello world');

      expect(runPipeline).toHaveBeenCalledWith(
        pipeline,
        {
          message: 'Hello world',
          channel: 'console',
          app: testContainer.name,
        },
        connector
      );
      connector.close();
    });

    test('It logs a rejected line handler promise', async () => {
      const testContainer = containerBootstrap();
      const pipeline = {};
      const error = new Error('pipeline failed');
      const logger = testContainer.get('logger');
      const logError = vi.spyOn(logger, 'error');
      vi.spyOn(testContainer, 'getPipeline').mockReturnValue(pipeline);
      vi.spyOn(testContainer, 'runPipeline').mockRejectedValue(error);
      const connector = new ConsoleConnector(testContainer);

      await connector.handleLine('Hello world');

      expect(logError).toHaveBeenCalledWith(error);
      connector.close();
    });
  });
});
