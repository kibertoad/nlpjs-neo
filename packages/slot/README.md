![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/slot

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/slot.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/slot)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/slot.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/slot)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## Introduction

`@nlpjs-neo/slot` is the slot filling manager: it keeps, per intent, the entities that the
bot needs, whether each one is mandatory, and the question to ask when it is missing. The
NLP pipeline uses it to keep asking until every mandatory entity of an intent is known.

## Installation

```bash
pnpm add @nlpjs-neo/slot
```

## Example of use

```javascript
import { SlotManager } from '@nlpjs-neo/slot';

const slotManager = new SlotManager();

slotManager.addSlot('travel', 'fromCity', true, {
  en: 'Where are you traveling from?',
});
slotManager.addSlot('travel', 'toCity', true, {
  en: 'Where are you traveling to?',
});

console.log(slotManager.getIntentEntityNames('travel')); // [ 'fromCity', 'toCity' ]
```

`addBatch(intent, entities)` registers several entities at once, `removeSlot`,
`updateSlot` and `existsSlot` manage them, and `save`/`load` serialize the configuration
with the rest of the model.

Slot filling is usually configured from the corpus instead of in code; see
[Slot filling](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/slot-filling.md).

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
