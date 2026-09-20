![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/lang-fr

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/lang-fr.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/lang-fr)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/lang-fr.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/lang-fr)

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

You can install @nlpjs-neo/lang-fr:

```bash
    pnpm add @nlpjs-neo/lang-fr
```

## Example of use

```javascript
import { containerBootstrap } from '@nlpjs-neo/core';
import { Nlp } from '@nlpjs-neo/nlp';
import { LangFr } from '@nlpjs-neo/lang-fr';

(async () => {
  const container = await containerBootstrap();
  container.use(Nlp);
  container.use(LangFr);
  const nlp = container.get('nlp');
  nlp.settings.autoSave = false;
  nlp.addLanguage('fr');
  // Adds the utterances and intents for the NLP
  nlp.addDocument('fr', "au revoir pour l'instant", 'greetings.bye');
  nlp.addDocument('fr', 'au revoir et soyez prudent', 'greetings.bye');
  nlp.addDocument('fr', 'très bien à plus tard', 'greetings.bye');
  nlp.addDocument('fr', 'je dois partir', 'greetings.bye');
  nlp.addDocument('fr', 'Salut', 'greetings.hello');
  
  // Train also the NLG
  nlp.addAnswer('fr', 'greetings.bye', 'à la prochaine');
  nlp.addAnswer('fr', 'greetings.bye', 'à bientôt!');
  nlp.addAnswer('fr', 'greetings.hello', 'salut comment ca va!');
  nlp.addAnswer('fr', 'greetings.hello', 'salutations!');
  await nlp.train();
  const response = await nlp.process('fr', 'je dois partir');
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
