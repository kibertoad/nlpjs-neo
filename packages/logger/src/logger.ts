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

/**
 * Arguments `pino` accepts on every level: either a record and a message, or
 * a message and its format arguments. The `Logger` below forwards what it was
 * called with, so it states that shape once rather than per level.
 */
type PinoLogArgs = Parameters<PinoLogger['info']>;

class Logger {
  declare logger: PinoLogger;
  declare name: string;

  constructor(destination?: DestinationStream) {
    this.name = 'logger';
    this.logger = createPinoLogger(destination);
  }

  debug(...args: unknown[]): void {
    this.logger.debug(...(args as PinoLogArgs));
  }

  info(...args: unknown[]): void {
    this.logger.info(...(args as PinoLogArgs));
  }

  warn(...args: unknown[]): void {
    this.logger.warn(...(args as PinoLogArgs));
  }

  error(...args: unknown[]): void {
    this.logger.error(...(args as PinoLogArgs));
  }

  log(...args: unknown[]): void {
    this.logger.info(...(args as PinoLogArgs));
  }

  trace(...args: unknown[]): void {
    this.logger.trace(...(args as PinoLogArgs));
  }

  fatal(...args: unknown[]): void {
    this.logger.fatal(...(args as PinoLogArgs));
  }
}

const logger = new Logger();

export { Logger };
export default logger;
