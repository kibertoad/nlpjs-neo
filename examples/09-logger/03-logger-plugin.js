import { defaultContainer } from '../../packages/core/src/index.js';
import { logger } from '../../packages/logger/src/index.js';

defaultContainer.use(logger);
const mylogger = defaultContainer.get('logger');
mylogger.info('This is an info message');
