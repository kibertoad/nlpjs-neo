![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/console-connector

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/console-connector.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/console-connector)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/console-connector.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/console-connector)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## TABLE OF CONTENTS

<!--ts-->

- [Installation](#installation)
- [Example of use inside NLP.js](#example-of-use-inside-nlpjs)
- [Example of use of the package](#example-of-use-of-the-package)
- [Example of use with @nlpjs-neo/basic](#example-of-use-with-nlpjs-neobasic)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Who is behind it](#who-is-behind-it)
- [License](#license)

<!--te-->

## Installation

You can install @nlpjs-neo/console-connector:

```bash
    pnpm add @nlpjs-neo/console-connector
```

## Example of use inside NLP.js

This is a little bit special component. It allows to manage scenarios where the main interface way is the console. You can find an example of use on **`examples/02-qna-classic`**.

## Example of use of the package

```javascript
import { ConsoleConnector } from '@nlpjs-neo/console-connector';

const connector = new ConsoleConnector();
connector.onHear = (self, text) => {
  self.say(`You said "${text}"`);
};
connector.say('Say something!');
```

## Example of use with @nlpjs-neo/basic

You must have a file _corpus.json_ in the folder of the source code:

```javascript
import { dockStart } from '@nlpjs-neo/basic';

(async () => {
  const dockConfiguration = {
    settings: {
      nlp: { corpora: ['./corpus.json'] },
    },
    use: ['Nlp', 'ConsoleConnector']
  };
  const dock = await dockStart(dockConfiguration);
  const nlp = dock.get('nlp');
  await nlp.train();
  const connector = dock.get('console');
  connector.say('Say something!');
})();
```

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
