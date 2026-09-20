/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
