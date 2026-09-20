# logger

This is a singleton to write logs. 
In this case due to browser compatibility, it works using console, and it is always mounted by default as a plugin in every container.
This logger can be replaced by other plugins, in fact there exists another plugin for a logger using pino that is mounted in the core-loader for backend implementations.

The methods implemented for logging are:
- trace
- debug
- info
- log
- warn
- error
- fatal

## Example of use

```javascript
import { logger } from '@nlpjs-neo/core';

logger.log('hello'); // hello
```

## Example of use with container

```javascript
import { Container } from '@nlpjs-neo/core';

const container = new Container();
const logger = container.get('logger');
logger.log('hello'); // hello
```