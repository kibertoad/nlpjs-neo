![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/language

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/language.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/language)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/language.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/language)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## Introduction

`@nlpjs-neo/language` guesses the language of a text from its trigrams, over the full
trigram database. Use `@nlpjs-neo/language-min` when you want the same API with a much
smaller dataset.

## Installation

```bash
pnpm add @nlpjs-neo/language
```

## Example of use

```javascript
import { Language } from '@nlpjs-neo/language';

const language = new Language();

console.log(language.guess('When the night has come And the land is dark')[0]);
// { alpha3: 'eng', alpha2: 'en', language: 'English', score: 1 }

console.log(language.guessBest('Quan arriba la nit i la terra es fosca'));
// { alpha3: 'cat', alpha2: 'ca', language: 'Catalan', score: 1 }
```

`guess(text, allowList, limit)` returns every candidate ordered by descending score;
`guessBest(text, allowList)` returns only the first one. `allowList` restricts the answer to
a set of locales.

The full documentation is at [Language guesser](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/language-guesser.md).

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
