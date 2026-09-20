import { defaultContainer } from '../../packages/core/src/index.js';

const logger = defaultContainer.get('logger');
logger.info('This is an info message');
