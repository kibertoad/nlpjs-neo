![NLPjs logo](screenshots/nlplogo.gif)

# NLP.js Neo

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/node-nlp-neo.svg?style=flat)](https://www.npmjs.com/package/node-nlp-neo)
[![NPM downloads](https://img.shields.io/npm/dm/node-nlp-neo.svg?style=flat)](https://www.npmjs.com/package/node-nlp-neo)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**nlpjs-neo is a refreshed and maintained fork of [axa-group/nlp.js](https://github.com/axa-group/nlp.js).**
The original project is no longer actively maintained; this fork continues it: the sources were
converted to TypeScript, the packages are ESM-only, the dependencies are modern and the
published surface is smaller. Packages are published under the `@nlpjs-neo/` scope, and the
batteries-included package is [`node-nlp-neo`](https://www.npmjs.com/package/node-nlp-neo).
Issues and pull requests belong in [kibertoad/nlpjs-neo](https://github.com/kibertoad/nlpjs-neo).

"NLP.js" is a general natural language utility for Node.js. Currently supporting:

- Guess the language of a phrase
- Fast _Levenshtein_ distance of two strings
- Search the best substring of a string with less _Levenshtein_ distance to a given pattern
- Get stemmers and tokenizers for several languages
- Sentiment Analysis for phrases (with negation support)
- Named Entity Recognition and management, multi-language support, and acceptance of similar strings, so the introduced text does not need to be exact
- Natural Language Processing Classifier, to classify an utterance into intents
- NLP Manager: a tool able to manage several languages, the Named Entities for each language, the utterances, and intents for the training of the classifier, and for a given utterance return the entity extraction, the intent classification and the sentiment analysis. Also, it is able to maintain a Natural Language Generation Manager for the answers
- 40 languages natively supported
- Any other language is supported through tokenization, even fantasy languages

![Hybrid bot](screenshots/hybridbot.gif)

## What is new in version 5

Version 5 is the first release of the fork, and it starts where nlp.js v4 left off. The
architecture is unchanged — small packages, a plugin container, pipelines — but everything
around it has moved:

- **TypeScript sources.** Every package was converted from JavaScript to TypeScript and
  ships bundled type declarations, so no `@types/*` packages are needed. The conversion kept
  the original runtime behaviour; describing it with accurate types is ongoing, package by
  package.
- **ESM only.** There is no CommonJS build; `require('node-nlp-neo')` does not work.
- **Node.js 22.12 or later.** Older runtimes are not supported.
- **Modernized dependencies.** The dependency tree was audited and rebuilt: unmaintained
  and vulnerable packages were replaced or dropped, and `pnpm audit` reports no known
  vulnerabilities.
- **A smaller surface.** 25 rarely used packages were dropped in the September 2026 cull:
  the bot framework, the database adapters, the API servers, the Facebook, Dialogflow,
  Direct Line and Microsoft Bot Framework connectors, the LUIS NLU plugin, the BERT
  packages and the QnA packages are gone. `ConsoleConnector` is the supported way to talk
  to a bot, and the NLU, NER, NLG and language packages are untouched.

If you are coming from nlp.js v4, the architecture below still applies:

- The library is split into small independent packages, one per language among others.
- It provides a plugin system, so you can provide your own plugins or replace the existing ones.
- It provides a container system for the plugins, settings for the plugins and also pipelines.
- A pipeline is code defining how the plugins interact. Usually it is linear: there is an input into the plugin, and this generates the input for the next one. As an example, the preparation of an utterance (the process to convert the utterance to a hashmap of stemmed features) is a pipeline like this: `normalize -> tokenize -> removeStopwords -> stem -> arrToObj`
- There is a simple compiler for the pipelines, but they can also be written in JavaScript (the compiler is itself a plugin, so other languages can be added as a plugin).
- A connector is something that has at least 2 methods: `hear` and `say`. The Console Connector is the connector included in the fork.
- Some plugins can be registered by language, so for different languages different plugins will be used. Also some plugins, like NLU, can be registered not only by language but also by domain (a functional set of intents that can be trained separately).
- Having plugins and pipelines makes it possible to write chatbots by only modifying the configuration and the pipelines file, without modifying the code.

### TABLE OF CONTENTS

<!--ts-->

- [Installation](#installation)
- [Documentation index](docs/v5/README.md)
- [QuickStart](docs/v5/quickstart.md)
  - [Install the library](docs/v5/quickstart.md#install-the-library)
  - [Create the code](docs/v5/quickstart.md#create-the-code)
  - [Extracting the corpus into a file](docs/v5/quickstart.md#extracting-the-corpus-into-a-file)
  - [Extracting the configuration into a file](docs/v5/quickstart.md#extracting-the-configuration-into-a-file)
  - [Creating your first pipeline](docs/v5/quickstart.md#creating-your-first-pipeline)
  - [Console Connector](docs/v5/quickstart.md#adding-your-first-connector)
  - [Extending your bot with the pipeline](docs/v5/quickstart.md#extending-your-bot-with-the-pipeline)
  - [Adding multiple languages](docs/v5/quickstart.md#adding-multilanguage)
  - [Recognizing the bot name and the channel](docs/v5/quickstart.md#recognizing-the-bot-name-and-the-channel)
  - [Adding logic to an intent](docs/v5/quickstart.md#adding-logic-to-an-intent)
  - [Mini FAQ](docs/v5/mini-faq.md)
- [Running in the browser](docs/v5/browser.md)
  - [What can be bundled](docs/v5/browser.md#what-can-be-bundled)
  - [Preparing to generate a bundle](docs/v5/browser.md#preparing-to-generate-a-bundle)
  - [Your first web NLP](docs/v5/browser.md#your-first-web-nlp)
  - [Creating a distributable version](docs/v5/browser.md#creating-a-distributable-version)
- [NER Quickstart](docs/v5/ner-quickstart.md)
  - [Install the needed packages](docs/v5/ner-quickstart.md#install-the-needed-packages)
  - [Create the conf.json](docs/v5/ner-quickstart.md#create-the-confjson)
  - [Create the corpus.json](docs/v5/ner-quickstart.md#create-the-corpusjson)
  - [Create the heros.json](docs/v5/ner-quickstart.md#create-the-herosjson)
  - [Create the pipelines.md](docs/v5/ner-quickstart.md#create-the-pipelinesmd)
  - [Create the index.js](docs/v5/ner-quickstart.md#create-the-indexjs)
  - [Start the application](docs/v5/ner-quickstart.md#start-the-application)
  - [Stored context](docs/v5/ner-quickstart.md#stored-context)
- [NeuralNetwork](docs/v5/neural.md)
  - [Introduction](docs/v5/neural.md#introduction)
  - [Installing](docs/v5/neural.md#installing)
  - [Corpus Format](docs/v5/neural.md#corpus-format)
  - [Example of use](docs/v5/neural.md#example-of-use)
  - [Exporting trained model to JSON and importing](docs/v5/neural.md#exporting-trained-model-to-json-and-importing)
  - [Options](docs/v5/neural.md#options)
- [Logger](docs/v5/logger.md)
  - [Introduction](docs/v5/logger.md#introduction)
  - [Default logger in @nlpjs-neo/core](docs/v5/logger.md#default-logger-in-nlpjs-neocore)
  - [Default logger in @nlpjs-neo/basic](docs/v5/logger.md#default-logger-in-nlpjs-neobasic)
  - [Adding your own logger to the container](docs/v5/logger.md#adding-your-own-logger-to-the-container)
- [@nlpjs-neo/emoji](docs/v5/emoji.md)
  - [Introduction](docs/v5/emoji.md#introduction)
  - [Installing](docs/v5/emoji.md#installing)
  - [Example of use](docs/v5/emoji.md#example-of-use)
- [@nlpjs-neo/console-connector](docs/v5/console-connector.md)
  - [Installation](docs/v5/console-connector.md#installation)
  - [Example of use inside NLP.js](docs/v5/console-connector.md#example-of-use-inside-nlpjs)
  - [Example of use of the package](docs/v5/console-connector.md#example-of-use-of-the-package)
  - [Example of use with @nlpjs-neo/basic](docs/v5/console-connector.md#example-of-use-with-nlpjs-neobasic)
- [@nlpjs-neo/similarity](docs/v5/similarity.md)
  - [Installation](docs/v5/similarity.md#installation)
  - [leven](docs/v5/similarity.md#leven)
  - [similarity](docs/v5/similarity.md#similarity)
  - [SpellCheck](docs/v5/similarity.md#spellcheck)
- [@nlpjs-neo/nlu](docs/v5/nlu.md)
  - [Installation](docs/v5/nlu.md#installation)
  - [NluNeural](docs/v5/nlu.md#nluneural)
  - [DomainManager](docs/v5/nlu.md#domainmanager)
  - [NluManager](docs/v5/nlu.md#nlumanager)
- [Example of use](#example-of-use)
- [False Positives](#false-positives)
- [Log Training Progress](#log-training-progress)
- [Language Support](docs/v5/language-support.md)
  - [Supported languages](docs/v5/language-support.md#supported-languages)
  - [Sentiment Analysis](docs/v5/language-support.md#sentiment-analysis)
  - [Example with several languages](docs/v5/language-support.md#example-with-several-languages)
- [Language Guesser](docs/v5/language-guesser.md)
- [Sentiment Analysis](docs/v5/sentiment-analysis.md)
- [NER Manager](docs/v5/ner-manager.md)
  - [Enum Named Entities](docs/v5/ner-manager.md#enum-entities)
  - [Regular Expression Named Entities](docs/v5/ner-manager.md#regex-entities)
  - [Trim Named Entities](docs/v5/ner-manager.md#trim-entities)
  - [Utterances with duplicated Entities](docs/v5/ner-manager.md#utterances-with-duplicated-entities)
- [Builtin Entity Extraction](docs/v5/builtin-entity-extraction.md)
  - [Email Extraction](docs/v5/builtin-entity-extraction.md#email-extraction)
  - [IP Extraction](docs/v5/builtin-entity-extraction.md#ip-extraction)
  - [Hashtag Extraction](docs/v5/builtin-entity-extraction.md#hashtag-extraction)
  - [Phone Number Extraction](docs/v5/builtin-entity-extraction.md#phone-number-extraction)
  - [URL Extraction](docs/v5/builtin-entity-extraction.md#url-extraction)
  - [Number Extraction](docs/v5/builtin-entity-extraction.md#number-extraction)
  - [Ordinal Extraction](docs/v5/builtin-entity-extraction.md#ordinal-extraction)
  - [Percentage Extraction](docs/v5/builtin-entity-extraction.md#percentage-extraction)
  - [Age Extraction](docs/v5/builtin-entity-extraction.md#age-extraction)
  - [Currency Extraction](docs/v5/builtin-entity-extraction.md#currency-extraction)
  - [Date Extraction](docs/v5/builtin-entity-extraction.md#date-extraction)
  - [Duration Extraction](docs/v5/builtin-entity-extraction.md#duration-extraction)
- [Integration with Duckling](docs/v5/builtin-duckling.md)
  - [Language support](docs/v5/builtin-duckling.md#language-support)
  - [How to integrate with Duckling](docs/v5/builtin-duckling.md#how-to-integrate-with-duckling)
- [NLP Manager](docs/v5/nlp-manager.md)
  - [Load/Save](docs/v5/nlp-manager.md#saving-and-loading-models)
  - [Import/Export](docs/v5/nlp-manager.md#importexport-using-json)
  - [Context](docs/v5/nlp-manager.md#context)
  - [Intent Logic (Actions, Pipelines)](docs/v5/nlp-intent-logics.md)
- [Slot Filling](docs/v5/slot-filling.md)
- [Loading from Excel](docs/v5/loading-from-excel.md)
- Languages — one package per locale, each with its own README, for example
  [English](packages/lang-en/README.md), [Spanish](packages/lang-es/README.md),
  [Italian](packages/lang-it/README.md) or [Indonesian](packages/lang-id/README.md)
- [Examples](examples/README.md)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Who is behind it](#who-is-behind-it)
- [License](#license)
  <!--te-->

## Installation

If you're looking to use NLP.js in your Node application, you can install it from npm:

```bash
    pnpm add node-nlp-neo
```

### ESM only, typed

All packages are written in TypeScript, published as ES modules with bundled type
declarations, and require **Node.js 22.12 or later**. `core`, `similarity`, `neural`, `slot`
and `sentiment` describe their inputs and results with real types; the remaining packages are
converted but still hand back `any` in places, which is being tightened package by package.
There is no CommonJS build, so
`require('node-nlp-neo')` does not work; use `import` instead:

```javascript
import { NlpManager } from 'node-nlp-neo';
```

From a CommonJS file, load them with a dynamic import:

```javascript
const { NlpManager } = await import('node-nlp-neo');
```

`node-nlp-neo` bundles every language and the main NLP features. If you only need a part of
the suite, install the individual packages instead: `@nlpjs-neo/basic` for a backend bot,
`@nlpjs-neo/nlu` for the classifiers, `@nlpjs-neo/similarity` for the Levenshtein utilities,
and one `@nlpjs-neo/lang-*` package per language.

## Example of use

The [`examples/`](examples/) folder has runnable examples for every part of the library.
[`examples/02-qna-classic`](examples/02-qna-classic) trains a bot and saves the model to a
file, so when the bot is started again the model is loaded instead of being trained again.

You can start to build your NLP from scratch with a few lines:

```javascript
import { NlpManager } from 'node-nlp-neo';

const manager = new NlpManager({ languages: ['en'], forceNER: true });
// Adds the utterances and intents for the NLP
manager.addDocument('en', 'goodbye for now', 'greetings.bye');
manager.addDocument('en', 'bye bye take care', 'greetings.bye');
manager.addDocument('en', 'okay see you later', 'greetings.bye');
manager.addDocument('en', 'bye for now', 'greetings.bye');
manager.addDocument('en', 'i must go', 'greetings.bye');
manager.addDocument('en', 'hello', 'greetings.hello');
manager.addDocument('en', 'hi', 'greetings.hello');
manager.addDocument('en', 'howdy', 'greetings.hello');

// Train also the NLG
manager.addAnswer('en', 'greetings.bye', 'Till next time');
manager.addAnswer('en', 'greetings.bye', 'see you soon!');
manager.addAnswer('en', 'greetings.hello', 'Hey there!');
manager.addAnswer('en', 'greetings.hello', 'Greetings!');

// Train and save the model.
await manager.train();
manager.save();
const response = await manager.process('en', 'I should go now');
console.log(response);
```

This produces the following result in a console:

```json
{
  "locale": "en",
  "utterance": "I should go now",
  "languageGuessed": false,
  "localeIso2": "en",
  "language": "English",
  "nluAnswer": {
    "classifications": [
      {
        "intent": "greetings.bye",
        "score": 1
      }
    ]
  },
  "classifications": [
    {
      "intent": "greetings.bye",
      "score": 1
    }
  ],
  "intent": "greetings.bye",
  "score": 1,
  "domain": "default",
  "sourceEntities": [
    {
      "start": 12,
      "end": 14,
      "resolution": {
        "values": [
          {
            "timex": "PRESENT_REF",
            "type": "datetime",
            "value": "2026-09-20 18:53:22"
          }
        ]
      },
      "text": "now",
      "typeName": "datetimeV2.datetime",
      "entity": "datetime"
    }
  ],
  "entities": [
    {
      "start": 12,
      "end": 14,
      "len": 3,
      "accuracy": 0.95,
      "sourceText": "now",
      "utteranceText": "now",
      "entity": "datetime",
      "rawEntity": "datetimeV2.datetime",
      "resolution": {
        "values": [
          {
            "timex": "PRESENT_REF",
            "type": "datetime",
            "value": "2026-09-20 18:53:22"
          }
        ]
      }
    }
  ],
  "answers": [
    {
      "answer": "Till next time"
    },
    {
      "answer": "see you soon!"
    }
  ],
  "answer": "Till next time",
  "actions": [],
  "sentiment": {
    "score": 0.5,
    "numWords": 4,
    "numHits": 1,
    "average": 0.125,
    "type": "senticon",
    "locale": "en",
    "vote": "positive"
  }
}
```

The answer is picked among the answers registered for the intent, so it alternates between
"Till next time" and "see you soon!", and the `datetime` entity resolves against the moment
the utterance is processed.

## False Positives

By default the neural network tries to avoid false positives. One of the internal processes
represents words never seen during training as a feature that adds weight to the `None`
intent, so an utterance built out of unknown words is classified as `None` instead of being
pushed into the closest declared intent. The feature is enabled per language, English among
them.

If you would rather have every utterance classified into one of the intents you declared,
disable it through the NLU settings:

```javascript
const manager = new NlpManager({ languages: ['en'], nlu: { useNoneFeature: false } });
```

## Log Training Progress

You can also add a log progress, so you can trace what is happening during the training.
You can log the progress to the console:

```javascript
const nlpManager = new NlpManager({ languages: ['en'], nlu: { log: true } });
```

Or you can provide your own log function:

```javascript
const logfn = (status, time) => console.log(status, time);
const nlpManager = new NlpManager({ languages: ['en'], nlu: { log: logfn } });
```

## Contributing

You can read the guide for how to contribute at [Contributing](CONTRIBUTING.md).

## Code of Conduct

You can read the Code of Conduct at [Code of Conduct](CODE_OF_CONDUCT.md).

## Who is behind it`?`

NLP.js was created and developed by AXA Group Operations Spain S.A., with
Jesus Seijas as its main author, and a long list of
[contributors](https://github.com/axa-group/nlp.js/graphs/contributors). AXA Group is no
longer involved in maintaining the library.

nlpjs-neo is a fork of that project, currently maintained by
[Igor Savin](https://github.com/kibertoad) and the
[contributors to the fork](https://github.com/kibertoad/nlpjs-neo/graphs/contributors). The
fork keeps the original codebase and license and modernizes the tooling around it. Open
issues and pull requests against the fork at
[kibertoad/nlpjs-neo](https://github.com/kibertoad/nlpjs-neo).

## License

Copyright (c) AXA Group Operations Spain S.A.

Copyright (c) 2026 Igor Savin

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
