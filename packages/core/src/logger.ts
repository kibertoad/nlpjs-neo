class Logger {
  declare name: any;

  constructor() {
    this.name = 'logger';
  }

  debug(...args) {
    // oxlint-disable-next-line no-console
    console.debug(...args);
  }

  info(...args) {
    // oxlint-disable-next-line no-console
    console.info(...args);
  }

  warn(...args) {
    // oxlint-disable-next-line no-console
    console.warn(...args);
  }

  error(...args) {
    // oxlint-disable-next-line no-console
    console.error(...args);
  }

  log(...args) {
    // oxlint-disable-next-line no-console
    console.log(...args);
  }

  trace(...args) {
    // oxlint-disable-next-line no-console
    console.trace(...args);
  }

  fatal(...args) {
    // oxlint-disable-next-line no-console
    console.error(...args);
  }
}

const logger = new Logger();

export default logger;
