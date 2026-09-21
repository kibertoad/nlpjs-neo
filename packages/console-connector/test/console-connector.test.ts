import { Container, containerBootstrap } from '@nlpjs-neo/core';
import type { Logger } from '@nlpjs-neo/core';
import type { RegisteredPipeline } from '@nlpjs-neo/core';
import type { ConnectorSettings } from '@nlpjs-neo/connector';
import { ConsoleConnector } from '../src/index.js';

const container = containerBootstrap();

global.console = {
  warn: vi.fn<(...args: unknown[]) => void>(),
  log: vi.fn<(...args: unknown[]) => void>(),
  error: vi.fn<(...args: unknown[]) => void>(),
} as unknown as Console;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Console Connector', () => {
  describe('Constructor', () => {
    test('Constructor', () => {
      const connector = new ConsoleConnector(
        container as unknown as ConnectorSettings
      );
      expect(connector).toBeDefined();
    });
  });

  describe('Say', () => {
    test('It should say an string', () => {
      console.log = vi.fn<(...args: unknown[]) => void>();
      const connector = new ConsoleConnector(
        container as unknown as ConnectorSettings
      );
      connector.say('Hello world');
      expect(console.log).toHaveBeenCalledWith('bot> Hello world');
    });
  });

  describe('Hear', () => {
    test('It waits for the hear pipeline', async () => {
      const testContainer = containerBootstrap();
      const pipeline = {} as RegisteredPipeline;
      const runPipeline = vi
        .fn<(...args: unknown[]) => Promise<void>>()
        .mockResolvedValue(undefined);
      vi.spyOn(testContainer, 'getPipeline').mockReturnValue(pipeline);
      vi.spyOn(testContainer, 'runPipeline').mockImplementation(runPipeline);
      const connector = new ConsoleConnector({ container: testContainer });

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

    test('It uses the console conversation id when processing with a bot', async () => {
      const testContainer = containerBootstrap();
      const process = vi
        .fn<(...args: unknown[]) => Promise<void>>()
        .mockResolvedValue(undefined);
      testContainer.register('bot', { container: testContainer, process });
      const connector = new ConsoleConnector({ container: testContainer });

      await connector.hear('Hello world');

      expect(process).toHaveBeenCalledWith(
        expect.objectContaining({
          conversation: { id: 'console000' },
        })
      );
      connector.close();
    });

    test('It logs a rejected line handler promise', async () => {
      const testContainer = containerBootstrap();
      const pipeline = {} as RegisteredPipeline;
      const error = new Error('pipeline failed');
      const logger = testContainer.get<Logger>('logger');
      const logError = vi
        .spyOn(logger, 'error')
        .mockImplementation(() => undefined);
      vi.spyOn(testContainer, 'getPipeline').mockReturnValue(pipeline);
      vi.spyOn(testContainer, 'runPipeline').mockRejectedValue(error);
      const connector = new ConsoleConnector({ container: testContainer });

      await connector.handleLine('Hello world');

      expect(logError).toHaveBeenCalledWith(error);
      connector.close();
    });

    test('It does not reject when the container has no logger', async () => {
      // A prefixed container never registers the default logger, so the
      // reporting path has to cope with `get('logger')` being undefined.
      const testContainer = new Container(true);
      const pipeline = {
        pipeline: [],
        compiler: testContainer.compilers.Default,
        compiled: [],
      };
      const error = new Error('pipeline failed');
      vi.spyOn(testContainer, 'getPipeline').mockReturnValue(pipeline);
      vi.spyOn(testContainer, 'runPipeline').mockRejectedValue(error);
      const connector = new ConsoleConnector({ container: testContainer });

      await expect(
        connector.handleLine('Hello world')
      ).resolves.toBeUndefined();

      expect(console.error).toHaveBeenCalledWith(error);
      connector.close();
    });
  });
});
