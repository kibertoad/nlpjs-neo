![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# node-nlp-neo

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/node-nlp-neo.svg?style=flat)](https://www.npmjs.com/package/node-nlp-neo)
[![NPM downloads](https://img.shields.io/npm/dm/node-nlp-neo.svg?style=flat)](https://www.npmjs.com/package/node-nlp-neo)

`node-nlp-neo` is the batteries-included package of
[NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). It bundles every language and the
NLU, NER, NLG, sentiment and language-guesser features behind the `NlpManager` class.

The packages are ESM only, written in TypeScript with bundled type declarations, and require
Node.js 22.12 or later.

## What it does

- Guess the language of a phrase
- Fast Levenshtein distance of two strings, and the best matching substring of a string
- Stemmers and tokenizers for 40 languages, tokenization for any other
- Sentiment analysis, with negation support
- Named entity recognition, multi-language, tolerant of misspellings
- Intent classification with a neural network
- Answer generation from intents, conditions and context

## Installation

```bash
pnpm add node-nlp-neo
```

There is no CommonJS build, so use `import`:

```javascript
import { NlpManager } from 'node-nlp-neo';
```

From a CommonJS file, load it with a dynamic import:

```javascript
const { NlpManager } = await import('node-nlp-neo');
```

If you only need part of the suite, install the individual packages instead —
`@nlpjs-neo/basic` for a backend bot, `@nlpjs-neo/nlu` for the classifiers,
`@nlpjs-neo/similarity` for the Levenshtein utilities, and one `@nlpjs-neo/lang-*` package
per language.

## Example of use

```javascript
import { NlpManager } from 'node-nlp-neo';

const manager = new NlpManager({ languages: ['en'], forceNER: true });

manager.addDocument('en', 'goodbye for now', 'greetings.bye');
manager.addDocument('en', 'bye bye take care', 'greetings.bye');
manager.addDocument('en', 'okay see you later', 'greetings.bye');
manager.addDocument('en', 'bye for now', 'greetings.bye');
manager.addDocument('en', 'i must go', 'greetings.bye');
manager.addDocument('en', 'hello', 'greetings.hello');
manager.addDocument('en', 'hi', 'greetings.hello');
manager.addDocument('en', 'howdy', 'greetings.hello');

manager.addAnswer('en', 'greetings.bye', 'Till next time');
manager.addAnswer('en', 'greetings.bye', 'see you soon!');
manager.addAnswer('en', 'greetings.hello', 'Hey there!');
manager.addAnswer('en', 'greetings.hello', 'Greetings!');

await manager.train();
manager.save();

const response = await manager.process('en', 'I should go now');
console.log(response.intent); // greetings.bye
console.log(response.answer); // one of the answers registered for the intent
```

## What is exported

| Export | What it is |
| ------ | ---------- |
| `NlpManager` | The manager that trains and processes utterances, the API most applications need |
| `NlpExcelReader` | Loads languages, entities, intents and answers from an Excel workbook |
| `Language` | The language guesser |
| `SentimentAnalyzer`, `SentimentManager` | Sentiment analysis for one or several languages |
| `NeuralNetwork` | The classifier on its own |
| `NlgManager`, `ActionManager` | Answer generation and intent actions |
| `BrainNLU` | The classifier with the v3-style API |
| `Recognizer`, `ConversationContext`, `MemoryConversationContext` | Conversation context helpers |
| `SpellCheck`, `Evaluator`, `Handlebars`, `removeEmojis`, `NlpUtil` | Utilities |
| `XDoc`, `XTable`, `XTableUtils` | Excel table reading |

## Documentation

The documentation lives in the repository:

- [Quick start](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/quickstart.md)
- [NLP Manager](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/nlp-manager.md)
- [NER Manager](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/ner-manager.md)
- [Language support](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/language-support.md)
- [Documentation index](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/README.md)
- [Runnable examples](https://github.com/kibertoad/nlpjs-neo/tree/main/examples)

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
