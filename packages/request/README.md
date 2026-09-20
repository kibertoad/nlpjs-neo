![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/request

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/request.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/request)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/request.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/request)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## Introduction

`@nlpjs-neo/request` is the HTTP client used by the suite, plus a file system plugin built
on it. The `fs` plugin reads local paths and URLs with the same call, which is what lets a
corpus, a configuration or a model be loaded from either.

## Installation

```bash
pnpm add @nlpjs-neo/request
```

## Example of use

```javascript
import { Container } from '@nlpjs-neo/core';
import { fs as requestfs } from '@nlpjs-neo/request';

const container = new Container();
container.register('fs', requestfs);

const fs = container.get('fs');
const readme = await fs.readFile('https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/README.md');
console.log(readme);
```

When the response is valid JSON it is returned parsed, otherwise as a string. The same call
reads from disk:

```javascript
const corpus = await fs.readFile('./corpus.json');
```

`@nlpjs-neo/core-loader` registers this plugin as `fs`, so `dockStart` already has it. This
package is Node.js only.

## Contributing

You can read the guide of how to contribute at [Contributing](https://github.com/kibertoad/nlpjs-neo/blob/main/CONTRIBUTING.md).

## Code of Conduct

You can read the Code of Conduct at [Code of Conduct](https://github.com/kibertoad/nlpjs-neo/blob/main/CODE_OF_CONDUCT.md).

## Who is behind it

NLP.js was created and developed by AXA Group Operations Spain S.A., with Jesus Seijas as
its main author. nlpjs-neo is a maintained fork of that project, kept up by
[Igor Savin](https://github.com/kibertoad) and the
[contributors to the fork](https://github.com/kibertoad/nlpjs-neo/graphs/contributors).

## License

Copyright (c) AXA Group Operations Spain S.A.

Copyright (c) 2026 Igor Savin

Released under the [MIT License](./LICENSE.md).
