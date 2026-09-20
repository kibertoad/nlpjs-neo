# Running in the browser

NLP.js is a Node.js project, but the packages that do the language work don't touch the file
system, so they can be bundled and run in a browser.

## What can be bundled

| Package | Browser |
| ------- | ------- |
| `@nlpjs-neo/core` | Yes, see the note on `resolveWorkerEntry` below |
| `@nlpjs-neo/nlp`, `@nlpjs-neo/nlu`, `@nlpjs-neo/ner`, `@nlpjs-neo/nlg` | Yes |
| `@nlpjs-neo/neural`, `@nlpjs-neo/similarity`, `@nlpjs-neo/language-min` | Yes |
| `@nlpjs-neo/lang-en-min` and the other `lang-*-min` packages | Yes |
| `@nlpjs-neo/lang-*` (full) | Yes, but the sentiment dictionaries make them large |
| `@nlpjs-neo/basic`, `@nlpjs-neo/core-loader`, `@nlpjs-neo/request`, `node-nlp-neo` | No, they read files and make HTTP requests from Node |

So in the browser you build the container yourself with `containerBootstrap` from
`@nlpjs-neo/core` instead of using `dockStart` from `@nlpjs-neo/basic`.

`@nlpjs-neo/core` exports `resolveWorkerEntry`, a helper that imports `node:fs` and
`node:path`. Nothing in the suite calls it any more, but a bundler still follows the import,
so alias `fs` and `path` to empty modules (or mark them external) if your bundler complains.

## Preparing to generate a bundle

The packages are ES modules, so use a bundler that understands ESM — esbuild, Rollup or
Vite. Older CommonJS-only bundlers such as browserify cannot read them.

```bash
pnpm add -D esbuild
```

Add a script to your _package.json_:

```json
    "browserdist": "esbuild ./index.js --bundle --minify --format=iife --outfile=./bundle.js"
```

From this moment you can generate _bundle.js_ with:

```bash
pnpm run browserdist
```

## Your first web NLP

Install the packages needed to run the NLP:

```bash
pnpm add @nlpjs-neo/core @nlpjs-neo/lang-en-min @nlpjs-neo/nlp
```

`@nlpjs-neo/core` provides the container system and the basic architecture,
`@nlpjs-neo/nlp` the NLP classes, and `@nlpjs-neo/lang-en-min` the English language without
the sentiment dictionaries, which are big.

Create an _index.js_ with this content:

```javascript
import { containerBootstrap } from '@nlpjs-neo/core';
import { Nlp } from '@nlpjs-neo/nlp';
import { LangEn } from '@nlpjs-neo/lang-en-min';

(async () => {
  const container = await containerBootstrap();
  container.use(Nlp);
  container.use(LangEn);
  const nlp = container.get('nlp');
  nlp.settings.autoSave = false;
  nlp.addLanguage('en');
  // Adds the utterances and intents for the NLP
  nlp.addDocument('en', 'goodbye for now', 'greetings.bye');
  nlp.addDocument('en', 'bye bye take care', 'greetings.bye');
  nlp.addDocument('en', 'okay see you later', 'greetings.bye');
  nlp.addDocument('en', 'bye for now', 'greetings.bye');
  nlp.addDocument('en', 'i must go', 'greetings.bye');
  nlp.addDocument('en', 'hello', 'greetings.hello');
  nlp.addDocument('en', 'hi', 'greetings.hello');
  nlp.addDocument('en', 'howdy', 'greetings.hello');

  // Train also the NLG
  nlp.addAnswer('en', 'greetings.bye', 'Till next time');
  nlp.addAnswer('en', 'greetings.bye', 'see you soon!');
  nlp.addAnswer('en', 'greetings.hello', 'Hey there!');
  nlp.addAnswer('en', 'greetings.hello', 'Greetings!');
  await nlp.train();
  const response = await nlp.process('en', 'I should go now');
  console.log(response);
})();
```

This creates the same model as the first example in the [quickstart](./quickstart.md). This
line matters, because by default the nlp plugin tries to save the model to disk after
training, which throws in a browser:

```javascript
nlp.settings.autoSave = false;
```

Now generate the bundle:

```bash
pnpm run browserdist
```

And load it from an HTML page:

```html
<html>
<head>
  <title>Test</title>
  <script src='./bundle.js'></script>
</head>
<body>
</body>
</html>
```

Open _index.html_ in a browser and take a look at the console.

## Creating a distributable version

With the previous example, every change to the bot means building the bundle again. Instead,
you can bundle only the NLP.js classes and expose them on `window`, so the same bundle is
reusable across bots and your bot logic stays separate from the library.

First, make _index.js_ re-export the libraries rather than contain the bot logic:

```javascript
import * as core from '@nlpjs-neo/core';
import * as nlp from '@nlpjs-neo/nlp';
import * as langenmin from '@nlpjs-neo/lang-en-min';

window.nlpjs = { ...core, ...nlp, ...langenmin };
```

Second, compile the bundle:

```bash
pnpm run browserdist
```

Third, move your bot logic into the HTML:

```html
<html>
<head>
  <title>Test</title>
  <script src='./bundle.js'></script>
  <script>
  const { containerBootstrap, Nlp, LangEn } = window.nlpjs;

  (async () => {
    const container = await containerBootstrap();
    container.use(Nlp);
    container.use(LangEn);
    const nlp = container.get('nlp');
    nlp.settings.autoSave = false;
    nlp.addLanguage('en');
    // Adds the utterances and intents for the NLP
    nlp.addDocument('en', 'goodbye for now', 'greetings.bye');
    nlp.addDocument('en', 'bye bye take care', 'greetings.bye');
    nlp.addDocument('en', 'okay see you later', 'greetings.bye');
    nlp.addDocument('en', 'bye for now', 'greetings.bye');
    nlp.addDocument('en', 'i must go', 'greetings.bye');
    nlp.addDocument('en', 'hello', 'greetings.hello');
    nlp.addDocument('en', 'hi', 'greetings.hello');
    nlp.addDocument('en', 'howdy', 'greetings.hello');

    // Train also the NLG
    nlp.addAnswer('en', 'greetings.bye', 'Till next time');
    nlp.addAnswer('en', 'greetings.bye', 'see you soon!');
    nlp.addAnswer('en', 'greetings.hello', 'Hey there!');
    nlp.addAnswer('en', 'greetings.hello', 'Greetings!');
    await nlp.train();
    const response = await nlp.process('en', 'I should go now');
    console.log(response);
  })();
  </script>
</head>
<body>
</body>
</html>
```

## React Native

There is no React Native build in this fork: the `node-nlp-rn` package and the React Native
HTTP client were not carried over. The packages listed as browser-safe above have no Node.js
dependencies, so they can be used from a React Native app whose bundler handles ES modules,
but this is not covered by the test suite.
