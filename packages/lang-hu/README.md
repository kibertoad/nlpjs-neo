![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/lang-hu

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/lang-hu.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/lang-hu)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/lang-hu.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/lang-hu)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## Introduction

`@nlpjs-neo/lang-hu` is the Hungarian language plugin of NLP.js Neo. It bundles the tokenizer, the
stemmer, the stopwords, the normalizer and, where the language has one, the sentiment
dictionary, and registers them in the container for the `hu` locale.

## Installation

```bash
pnpm add @nlpjs-neo/lang-hu
```

## Example of use

```javascript
import { containerBootstrap } from '@nlpjs-neo/core';
import { Nlp } from '@nlpjs-neo/nlp';
import { LangHu } from '@nlpjs-neo/lang-hu';

const container = await containerBootstrap();
container.use(Nlp);
container.use(LangHu);

const nlp = container.get('nlp');
nlp.settings.autoSave = false;
nlp.addLanguage('hu');
// add your documents and answers, then train
await nlp.train();
```

From a `conf.json`, name the plugin in the `use` list:

```json
{
  "use": ["Basic", "LangHu"]
}
```

The classes can also be used on their own:

```javascript
import { StopwordsHu } from '@nlpjs-neo/lang-hu';
```

## What it exports

| Export | What it is |
| ------ | ---------- |
| `LangHu` | the plugin that registers everything below in a container |
| `StemmerHu` | reduces a token to its stem |
| `StopwordsHu` | removes the words that carry no meaning for the classification |
| `TokenizerHu` | splits a text into tokens |
| `NormalizerHu` | lowercases the text and strips accents |
| `SentimentHu` | the sentiment dictionary of the language |

`node-nlp-neo` and `@nlpjs-neo/lang-all` already include this package, so install it
directly only when you assemble the container yourself.

See [Language support](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/language-support.md) for what each locale
supports.

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
