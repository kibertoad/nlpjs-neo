![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/lang-ar

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/lang-ar.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/lang-ar)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/lang-ar.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/lang-ar)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## TABLE OF CONTENTS

<!--ts-->

- [Installation](#installation)
- [Example of use](#example-of-use)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Who is behind it](#who-is-behind-it)
- [License](#license)
  <!--te-->

## Installation

You can install @nlpjs-neo/lang-ar:

```bash
    pnpm add @nlpjs-neo/lang-ar
```

## Example of use

```javascript
import { containerBootstrap } from '@nlpjs-neo/core';
import { Nlp } from '@nlpjs-neo/nlp';
import { LangAr } from '@nlpjs-neo/lang-ar';

(async () => {
  const container = await containerBootstrap();
  container.use(Nlp);
  container.use(LangAr);
  const nlp = container.get('nlp');
  nlp.settings.autoSave = false;
  nlp.addLanguage('ar');
  // Adds the utterances and intents for the NLP
  nlp.addDocument('ar', 'adios por ahora', 'greetings.bye');
  nlp.addDocument('ar', 'adios y ten cuidado', 'greetings.bye');
  nlp.addDocument('ar', 'muy bien nos vemos luego', 'greetings.bye');
  nlp.addDocument('ar', 'debo irme', 'greetings.bye');
  nlp.addDocument('ar', 'hola', 'greetings.hello');
  
  // Train also the NLG
  nlp.addAnswer('ar', 'greetings.bye', 'hasta la proxima');
  nlp.addAnswer('ar', 'greetings.bye', '¡te veo pronto!');
  nlp.addAnswer('ar', 'greetings.hello', '¡hola que tal!');
  nlp.addAnswer('ar', 'greetings.hello', '¡salludos!');
  await nlp.train();
  const response = await nlp.process('ar', 'debo irme');
  console.log(response);
})();
```

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
