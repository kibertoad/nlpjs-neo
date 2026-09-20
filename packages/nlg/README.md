![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/nlg

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/nlg.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/nlg)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/nlg.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/nlg)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## Introduction

`@nlpjs-neo/nlg` is the Natural Language Generation package: given an intent, a locale and
the context of the conversation, it picks the answer to return. `NlgManager` holds the
answers and their conditions, and `ActionManager` holds the actions registered per intent.

## Installation

```bash
pnpm add @nlpjs-neo/nlg
```

## Example of use

```javascript
import { containerBootstrap } from '@nlpjs-neo/core';
import { NlgManager } from '@nlpjs-neo/nlg';

const container = await containerBootstrap();
const nlg = new NlgManager({ container });

nlg.add('en', 'greetings.bye', 'Till next time');
nlg.add('en', 'greetings.bye', 'see you soon!');

const answer = await nlg.find('en', 'greetings.bye');
console.log(answer.answer);
```

An answer can carry a condition over the context, so different answers are returned for
different entity values. This is what the `NlpManager` uses to build its answers; see
[NLP Manager](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/nlp-manager.md).

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
