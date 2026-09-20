import { pino } from 'pino';
import type { DestinationStream, Logger as PinoLogger } from 'pino';
import prettyStream from 'pino-pretty';

/**
 * Builds the `pino` instance behind a `Logger`. The destination is injectable
 * so that a caller -- the test suite above all -- can read back what was
 * actually written, instead of having to trust a spy on the method it called.
 *
 * Outside production the records go through `pino-pretty`. It is wired up as a
 * destination stream rather than as a `transport`, because a transport runs in
 * a worker thread: importing this package would then spawn one per process and
 * records could be lost unless every caller flushed on exit.
 */
function createPinoLogger(destination?: DestinationStream): PinoLogger {
  if (destination) {
    return pino({}, destination);
  }
  if (process.env.NODE_ENV === 'production') {
    return pino();
  }
  return pino(prettyStream({ colorize: true }));
}

class Logger {
  declare logger: PinoLogger;
  declare name: string;

  constructor(destination?: DestinationStream) {
    this.name = 'logger';
    this.logger = createPinoLogger(destination);
  }

  debug(...args) {
    this.logger.debug(...(args as [any]));
  }

  info(...args) {
    this.logger.info(...(args as [any]));
  }

  warn(...args) {
    this.logger.warn(...(args as [any]));
  }

  error(...args) {
    this.logger.error(...(args as [any]));
  }

  log(...args) {
    this.logger.info(...(args as [any]));
  }

  trace(...args) {
    this.logger.trace(...(args as [any]));
  }

  fatal(...args) {
    this.logger.fatal(...(args as [any]));
  }
}

const logger = new Logger();

export { Logger };
export default logger;
