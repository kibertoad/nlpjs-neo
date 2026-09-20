import { defaultContainer } from '../../packages/core/src/index.js';

const loggerInstance = {
  trace: (msg) => console.trace(`[TRACE] ${msg}`),
  debug: (msg) => console.debug(`[DEBUG] ${msg}`),
  info: (msg) => console.info(`[INFO] ${msg}`),
  log: (msg) => console.log(`[LOG] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  fatal: (msg) => console.error(`[FATAL] ${msg}`),
};
defaultContainer.register('logger', loggerInstance);

const logger = defaultContainer.get('logger');
logger.info('This is an info message');
