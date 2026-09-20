# @nlpjs-neo/console-connector

## Installation

You can install the console connector @nlpjs-neo/console-connector using:

```bash
    pnpm add @nlpjs-neo/console-connector
```

## Example of use inside NLP.js

This is a little bit special component. 
It allows you to manage scenarios where the main interface is the console. You can find an example of use in [`examples/11-console-connector`](../../examples/11-console-connector).

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

You must have a file _corpus.json_ in the source code folder:

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
