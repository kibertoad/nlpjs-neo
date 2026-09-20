![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/language-min

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/language-min.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/language-min)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/language-min.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/language-min)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## Introduction

`@nlpjs-neo/language-min` is the small-footprint build of the language guesser: the same
`Language` class as `@nlpjs-neo/language`, but shipped without the trigram models. It is
what the NLU and NER packages depend on, and the one to use in a browser bundle.

Because it carries no data of its own, it cannot guess until it has been trained: on its own
it falls back to the first language of the script it detects. The NLU trains it with the
trigrams of your corpus, which is why a multi-language bot guesses correctly with it. For
standalone guessing, use [`@nlpjs-neo/language`](../language), which ships the full models.

## Installation

```bash
pnpm add @nlpjs-neo/language-min
```

## Example of use

```javascript
import { Language } from '@nlpjs-neo/language-min';

const language = new Language();

language.addExtraSentence('en', 'When the night has come and the land is dark');
language.addExtraSentence('en', 'hello how are you doing today my friend');
language.addExtraSentence('es', 'Cuando la noche ha llegado y la tierra está oscura');
language.addExtraSentence('es', 'hola qué tal estás hoy amigo mío');
language.processExtraSentences();

console.log(language.guessBest('the moon is the only light we see'));
// { alpha3: 'eng', alpha2: 'en', language: 'English', score: 1 }
console.log(language.guessBest('la luna es la única luz que vemos'));
// { alpha3: 'spa', alpha2: 'es', language: 'Spanish', score: 1 }
```

`guess(text, allowList, limit)` returns every candidate ordered by descending score, and
`guessBest(text, allowList)` only the first one. The API is documented at
[Language guesser](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/language-guesser.md).

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
