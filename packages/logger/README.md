![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/logger

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/logger.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/logger)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/logger.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/logger)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## TABLE OF CONTENTS

<!--ts-->

- [Installation](#installation)
- [Example of use](#example-of-use)
- [Default logger in @nlpjs-neo/core](#default-logger-in-nlpjs-neocore)
- [Default logger in @nlpjs-neo/basic](#default-logger-in-nlpjs-neobasic)
- [Adding your own logger to the container](#adding-your-own-logger-to-the-container)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Who is behind it](#who-is-behind-it)
- [License](#license)
  <!--te-->

## Installation

You can install @nlpjs-neo/logger:

```bash
    pnpm add @nlpjs-neo/logger
```

## Example of use

```javascript
import { Logger } from '@nlpjs-neo/logger';

const logger = new Logger();

logger.info('Hello world!!!')
```

## Default logger in @nlpjs-neo/core
By default, a logger based on console is added to the NLP.js container

```javascript
import { defaultContainer } from '@nlpjs-neo/core';

const logger = defaultContainer.get('logger');
logger.info('This is an info message');
// This is an info message
```

## Default logger in @nlpjs-neo/basic
When using the basic package of NLP.js, a logger based on pino is added.

```javascript
import { dockStart } from '@nlpjs-neo/basic';

(async () => {
  const dock = await dockStart({ use: ['Basic']});
  const logger = dock.get('logger');
  logger.info('This is an info message');
  logger.log('This is a log message');
  logger.warn('This is a warn message');
  logger.error('This is an error message');
})();
```

## Adding your own logger to the container
You can register your own logger to the container:

```javascript
import { dockStart } from '@nlpjs-neo/basic';

(async () => {
  const dock = await dockStart({ use: ['Basic']});
  const container = dock.getContainer();
  const loggerInstance = {
    trace: msg => console.trace(`[TRACE] ${msg}`),
    debug: msg => console.debug(`[DEBUG] ${msg}`),
    info: msg => console.info(`[INFO] ${msg}`),
    log: msg => console.log(`[LOG] ${msg}`),
    warn: msg => console.warn(`[WARN] ${msg}`),
    error: msg => console.error(`[ERROR] ${msg}`),
    fatal: msg => console.error(`[FATAL] ${msg}`),
  }
  container.register('logger', loggerInstance);
  const logger = dock.get('logger');
  logger.info('This is an info message');
})();
```

## Contributing

You can read the guide of how to contribute at [Contributing](https://github.com/kibertoad/nlpjs-neo/blob/main/CONTRIBUTING.md).

## Code of Conduct

You can read the Code of Conduct at [Code of Conduct](https://github.com/kibertoad/nlpjs-neo/blob/main/CODE_OF_CONDUCT.md).

## Who is behind it

NLP.js was created and developed by AXA Group Operations Spain S.A., with Jesus Seijas as
its main author; AXA Group is no longer involved in maintaining it. nlpjs-neo is a fork of
that project, currently maintained by [Igor Savin](https://github.com/kibertoad) and the
[contributors to the fork](https://github.com/kibertoad/nlpjs-neo/graphs/contributors).

## License

Copyright (c) AXA Group Operations Spain S.A.

Copyright (c) 2026 Igor Savin

Released under the [MIT License](./LICENSE.md).
