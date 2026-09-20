![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/builtin-microsoft

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/builtin-microsoft.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/builtin-microsoft)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/builtin-microsoft.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/builtin-microsoft)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## Introduction

`@nlpjs-neo/builtin-microsoft` extracts builtin ("golden") entities — emails, numbers,
ordinals, percentages, dimensions, ages, currencies, dates and durations — in process, using
[Microsoft Recognizers](https://github.com/microsoft/Recognizers-Text). It is the extractor
`NlpManager` registers by default.

## Installation

```bash
pnpm add @nlpjs-neo/builtin-microsoft
```

## Example of use

```javascript
import { dockStart } from '@nlpjs-neo/basic';

const dock = await dockStart({ use: ['Basic', 'BuiltinMicrosoft', 'LangEn'] });

const builtin = dock.get('builtin-microsoft');
const ner = dock.get('ner');
ner.container.register('extract-builtin-??', builtin, true);
```

Register the extractor under `extract-builtin-<locale>` to use it for one locale only, or
under `extract-builtin-??` for every locale.

The entity types, their coverage per language and the shape of each result are documented at
[Builtin entity extraction](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/builtin-entity-extraction.md).

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
