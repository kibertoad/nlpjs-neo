![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/lang-pl

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/lang-pl.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/lang-pl)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/lang-pl.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/lang-pl)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## Introduction

`@nlpjs-neo/lang-pl` is the Polish language plugin of NLP.js Neo. It bundles the tokenizer, the
stemmer, the stopwords, the normalizer and, where the language has one, the sentiment
dictionary, and registers them in the container for the `pl` locale.

## Installation

```bash
pnpm add @nlpjs-neo/lang-pl
```

## Example of use

```javascript
import { containerBootstrap } from '@nlpjs-neo/core';
import { Nlp } from '@nlpjs-neo/nlp';
import { LangPl } from '@nlpjs-neo/lang-pl';

const container = await containerBootstrap();
container.use(Nlp);
container.use(LangPl);

const nlp = container.get('nlp');
nlp.settings.autoSave = false;
nlp.addLanguage('pl');
// add your documents and answers, then train
await nlp.train();
```

This plugin is not resolvable by name from a `conf.json` yet, so mount the class in code
as shown above.

The classes can also be used on their own:

```javascript
import { StopwordsPl } from '@nlpjs-neo/lang-pl';
```

## What it exports

| Export | What it is |
| ------ | ---------- |
| `LangPl` | the plugin that registers everything below in a container |
| `StemmerPl` | reduces a token to its stem |
| `StopwordsPl` | removes the words that carry no meaning for the classification |
| `TokenizerPl` | splits a text into tokens |
| `NormalizerPl` | lowercases the text and strips accents |
| `SentimentPl` | the sentiment dictionary of the language |

`node-nlp-neo` and `@nlpjs-neo/lang-all` already include this package, so install it
directly only when you assemble the container yourself.

See [Language support](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/language-support.md) for what each locale
supports.

## Credits

The stemmer is a port of [pl_stemmer](https://github.com/Tutanchamon/pl_stemmer) by Błażej
Kubiński, a simple stemmer for Polish based on Porter's algorithm.

> MIT License. Copyright (c) 2017 Błażej Kubiński. Permission is hereby granted, free of charge, to
> any person obtaining a copy of this software and associated documentation files, to deal in the
> Software without restriction, including without limitation the rights to use, copy, modify, merge,
> publish, distribute, sublicense, and/or sell copies of the Software, subject to the inclusion of
> this copyright notice and this permission notice in all copies or substantial portions of the
> Software. The Software is provided "as is", without warranty of any kind.

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
