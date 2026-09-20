![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/evaluator

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/evaluator.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/evaluator)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/evaluator.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/evaluator)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## TABLE OF CONTENTS

<!--ts-->

- [Installation](#installation)
- [Example of use](#example-of-use)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Who is behind it](#who-is-behind-it)
- [License](#license)
  <!--te-->

## Installation

You can install @nlpjs-neo/evaluator:

```bash
    pnpm add @nlpjs-neo/evaluator
```

## Example of use

```javascript
import { Evaluator } from '@nlpjs-neo/evaluator';

const context = { a: 1, b: 2 };
const evaluator = new Evaluator();
const question = 'a = b;';
const answer = evaluator.evaluateAll(question, context);
```

The value of the variable "`answer`" will be `[2]`.

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
