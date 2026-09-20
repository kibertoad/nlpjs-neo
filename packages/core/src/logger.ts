import type { Logger as LoggerContract } from './types.js';

class Logger implements LoggerContract {
  declare name: string;

  constructor() {
    this.name = 'logger';
  }

  debug(...args: unknown[]): void {
    // oxlint-disable-next-line no-console
    console.debug(...args);
  }

  info(...args: unknown[]): void {
    // oxlint-disable-next-line no-console
    console.info(...args);
  }

  warn(...args: unknown[]): void {
    // oxlint-disable-next-line no-console
    console.warn(...args);
  }

  error(...args: unknown[]): void {
    // oxlint-disable-next-line no-console
    console.error(...args);
  }

  log(...args: unknown[]): void {
    // oxlint-disable-next-line no-console
    console.log(...args);
  }

  trace(...args: unknown[]): void {
    // oxlint-disable-next-line no-console
    console.trace(...args);
  }

  fatal(...args: unknown[]): void {
    // oxlint-disable-next-line no-console
    console.error(...args);
  }
}

const logger = new Logger();

export default logger;
