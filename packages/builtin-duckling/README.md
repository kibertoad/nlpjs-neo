![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/builtin-duckling

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/builtin-duckling.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/builtin-duckling)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/builtin-duckling.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/builtin-duckling)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## Introduction

`@nlpjs-neo/builtin-duckling` extracts builtin ("golden") entities — dates, numbers,
durations, amounts of money and the rest — by forwarding the utterance to a running
[Duckling](https://github.com/facebook/duckling) server. It covers more languages than
`@nlpjs-neo/builtin-microsoft`, at the cost of running that server.

## Installation

```bash
pnpm add @nlpjs-neo/builtin-duckling
```

## Example of use

```javascript
import { dockStart } from '@nlpjs-neo/basic';

const dock = await dockStart({
  settings: {
    'builtin-duckling': { ducklingUrl: 'http://localhost:8000/parse' },
  },
  use: ['Basic', 'BuiltinDuckling', 'LangEn'],
});

const builtin = dock.get('builtin-duckling');
const ner = dock.get('ner');
ner.container.register('extract-builtin-??', builtin, true);
```

`ducklingUrl` defaults to the `DUCKLING_URL` environment variable, and to
`http://localhost:8000/parse` when that is unset. With `node-nlp-neo` it is enough to pass
`ner: { ducklingUrl }` or `ner: { useDuckling: true }` to the `NlpManager` constructor.

The full documentation, with the response of each entity type, is at
[Integration with Duckling](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/builtin-duckling.md).

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
