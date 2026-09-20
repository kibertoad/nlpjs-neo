# NLP.js Neo documentation

Documentation for version 5, the first version of
[the fork](https://github.com/kibertoad/nlpjs-neo). Version 5 continues nlp.js v4: the
architecture is the same, the packages moved to the `@nlpjs-neo/` scope, and the packages
listed as removed in the [README](../../README.md#what-is-new-in-version-5) are gone.

## Getting started

- [Quick start](./quickstart.md) — from a few lines of code to a configuration-driven bot
- [NER quick start](./ner-quickstart.md) — a bot that recognizes entities and keeps context
- [Mini FAQ](./mini-faq.md)
- [Running in the browser](./browser.md)

## The NLP pipeline

- [NLP Manager](./nlp-manager.md) — training, models, context
- [NLP intent logics](./nlp-intent-logics.md) — actions, pipelines and `onIntent`
- [NLU](./nlu.md) — `NluNeural`, `DomainManager` and `NluManager`
- [NeuralNetwork](./neural.md) — the classifier on its own
- [Slot filling](./slot-filling.md)

## Entities

- [NER Manager](./ner-manager.md) — enum, regex and trim entities
- [Builtin entity extraction](./builtin-entity-extraction.md) — emails, numbers, dates and the rest
- [Integration with Duckling](./builtin-duckling.md)

## Languages and text utilities

- [Language support](./language-support.md) — the table of locales and what each one supports
- [Language guesser](./language-guesser.md)
- [Sentiment analysis](./sentiment-analysis.md)
- [Similarity](./similarity.md) — Levenshtein distance and spell checking
- [Emoji](./emoji.md)

## Plumbing

- [Console connector](./console-connector.md)
- [Logger](./logger.md)
- [Loading from Excel](./loading-from-excel.md)
- Core helpers: [arr-to-obj](./core/arr-to-obj.md), [obj-to-arr](./core/obj-to-arr.md),
  [file system](./core/file-system.md), [logger](./core/logger.md),
  [normalizer](./core/normalizer.md), [stopwords](./core/stopwords.md),
  [timer](./core/timer.md), [uuid](./core/uuid.md)

## Elsewhere in the repository

- [Runnable examples](../../examples)
- [Dependency audit, September 2026](../dependency-audit-2026-09.md)
- [Migrating Excel loading off SheetJS](../migrate-sheetjs-to-office-kit.md)
- [Contributing](../../CONTRIBUTING.md)
