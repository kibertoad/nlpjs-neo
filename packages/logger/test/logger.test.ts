import { Writable } from 'node:stream';
import prettyStream from 'pino-pretty';
import { Logger, logger } from '../src/index.js';

interface Capture {
  lines: () => any[];
  stream: Writable;
}

/**
 * A `pino` destination that keeps every record it is handed, so a test can
 * assert on what was logged rather than on the fact that a method was called.
 */
function capture(): Capture {
  const chunks: string[] = [];
  return {
    lines: () =>
      chunks
        .join('')
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line)),
    stream: new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(chunk.toString());
        callback();
      },
    }),
  };
}

function loggerWithCapture(): { logger: Logger; captured: Capture } {
  const captured = capture();
  return { logger: new Logger(captured.stream), captured };
}

describe('logger', () => {
  describe('singleton', () => {
    test('It should be a singleton', () => {
      expect(logger).toBeDefined();
    });

    test('It should be named logger', () => {
      expect(logger.name).toEqual('logger');
    });

    test('It should expose the same surface as the core logger', () => {
      for (const method of [
        'debug',
        'info',
        'warn',
        'error',
        'log',
        'trace',
        'fatal',
      ]) {
        expect(typeof logger[method]).toEqual('function');
      }
    });
  });

  describe('logging', () => {
    // `pino` filters anything below its level before it reaches the
    // destination, and the default level is info, so `debug` and `trace` are
    // asserted through a logger that is allowed to emit them.
    test.each([
      ['info', 30],
      ['warn', 40],
      ['error', 50],
      ['fatal', 60],
    ])('It should write a %s record', (method, level) => {
      const { logger: instance, captured } = loggerWithCapture();
      const message = `This is a ${method} message`;
      instance[method](message);
      expect(captured.lines()).toHaveLength(1);
      expect(captured.lines()[0]).toMatchObject({ level, msg: message });
    });

    test.each([
      ['debug', 20],
      ['trace', 10],
    ])(
      'It should write a %s record when the level allows it',
      (method, level) => {
        const { logger: instance, captured } = loggerWithCapture();
        instance.logger.level = 'trace';
        const message = `This is a ${method} message`;
        instance[method](message);
        expect(captured.lines()).toHaveLength(1);
        expect(captured.lines()[0]).toMatchObject({ level, msg: message });
      }
    );

    test('It should not write a record below the level', () => {
      const { logger: instance, captured } = loggerWithCapture();
      instance.debug('This is a debug message');
      expect(captured.lines()).toEqual([]);
    });

    test('It should log at the info level', () => {
      const { logger: instance, captured } = loggerWithCapture();
      instance.log('This is a log message');
      expect(captured.lines()[0]).toMatchObject({
        level: 30,
        msg: 'This is a log message',
      });
    });

    test('It should merge an object into the record', () => {
      const { logger: instance, captured } = loggerWithCapture();
      instance.info({ intent: 'greeting', score: 0.98 }, 'classified');
      expect(captured.lines()[0]).toMatchObject({
        level: 30,
        msg: 'classified',
        intent: 'greeting',
        score: 0.98,
      });
    });

    test('It should serialize an error', () => {
      const { logger: instance, captured } = loggerWithCapture();
      instance.error(new Error('something broke'));
      const [record] = captured.lines();
      expect(record.level).toEqual(50);
      expect(record.err.message).toEqual('something broke');
      expect(record.err.stack).toBeDefined();
    });

    test('It should interpolate a format string', () => {
      const { logger: instance, captured } = loggerWithCapture();
      instance.info('locale %s, score %d', 'en', 0.5);
      expect(captured.lines()[0].msg).toEqual('locale en, score 0.5');
    });

    test('It should keep the records of each call', () => {
      const { logger: instance, captured } = loggerWithCapture();
      instance.info('first');
      instance.warn('second');
      instance.error('third');
      expect(captured.lines().map((record) => record.msg)).toEqual([
        'first',
        'second',
        'third',
      ]);
    });
  });

  describe('pretty printing', () => {
    // The development branch of `createPinoLogger` sends records through
    // `pino-pretty`. Asserting that it does not throw would not notice a
    // formatter that stopped formatting, so read the formatted line back.
    test('It should format a record for a human', async () => {
      const lines: string[] = [];
      const sink = new Writable({
        write(chunk, _encoding, callback) {
          lines.push(chunk.toString());
          callback();
        },
      });
      const instance = new Logger(
        prettyStream({ colorize: false, destination: sink, sync: true })
      );
      instance.warn('the model is missing');
      expect(lines).toHaveLength(1);
      expect(lines[0]).toContain('WARN');
      expect(lines[0]).toContain('the model is missing');
      // The pretty output is a formatted line, not the raw JSON record.
      expect(lines[0]).not.toContain('"level":40');
    });
  });

  describe('construction', () => {
    test('It should build a development logger without throwing', () => {
      const previous = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      try {
        expect(() => new Logger()).not.toThrow();
      } finally {
        process.env.NODE_ENV = previous;
      }
    });

    test('It should build a production logger without throwing', () => {
      const previous = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        expect(() => new Logger()).not.toThrow();
      } finally {
        process.env.NODE_ENV = previous;
      }
    });
  });
});
