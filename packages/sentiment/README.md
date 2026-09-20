![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/sentiment

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/sentiment.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/sentiment)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/sentiment.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/sentiment)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## Introduction

`@nlpjs-neo/sentiment` scores the sentiment of an utterance using the dictionary of its
language, with support for negations where the language provides them. Three dictionary
types are used: AFINN, Senticon and Pattern.

## Installation

```bash
pnpm add @nlpjs-neo/sentiment @nlpjs-neo/lang-en
```

## Example of use

The analyzer takes the language plugins from its container, so mount the languages you need:

```javascript
import { containerBootstrap } from '@nlpjs-neo/core';
import { SentimentAnalyzer } from '@nlpjs-neo/sentiment';
import { LangEn } from '@nlpjs-neo/lang-en';
import { Nlu } from '@nlpjs-neo/nlu';

const container = await containerBootstrap();
container.use(LangEn);
container.use(Nlu);

const analyzer = new SentimentAnalyzer({ container });
const result = await analyzer.process({ utterance: 'I like cats', locale: 'en' });
console.log(result.sentiment);
// { score: 0.344, numWords: 3, numHits: 1, average: 0.114..., type: 'senticon', locale: 'en', vote: 'positive' }
```

`node-nlp-neo` wraps this in `SentimentAnalyzer` and `SentimentManager`, which mount every
language for you; see
[Sentiment analysis](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/sentiment-analysis.md).
The per-language coverage is at
[Language support](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/language-support.md#sentiment-analysis).

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
