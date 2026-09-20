# Mini-FAQ

A collection of short answers to the questions that come up most often. If something you
need is not covered here, open an issue at
[kibertoad/nlpjs-neo](https://github.com/kibertoad/nlpjs-neo/issues).

**- Where do I find an example of use?** In the [README](../../README.md#example-of-use),
and in the [`examples/`](../../examples) folder, which has a runnable project per feature.

**- What is the difference between `node-nlp-neo` and the `@nlpjs-neo/*` packages?** The
library is split into small packages, one per language and one per feature. `node-nlp-neo`
bundles them behind the `NlpManager` class, the API most applications need. Install the
individual packages instead when you care about install size.

**- I don't find the `NluManager` in `node-nlp-neo`.** You don't need it: `NlpManager`
handles the NLU, the NLG, the language guesser and the NER. If you do want the lower-level
classes, install [`@nlpjs-neo/nlu`](./nlu.md).

**- How do I start with the plugin and pipeline architecture?** With the
[quickstart](./quickstart.md).

**- `require('node-nlp-neo')` throws.** The packages are ESM only, and there is no CommonJS
build. Use `import`, or `await import('node-nlp-neo')` from a CommonJS file. Node.js 22.12
or later is required.

**- Can I run this in the browser?** Yes, for the packages that don't touch the file system.
See [Running in the browser](./browser.md).

**- How do I test my chatbot in the console?**
[Adding your first connector](./quickstart.md#adding-your-first-connector). The console
connector is the connector shipped with the fork; the Facebook, Dialogflow, Direct Line and
Microsoft Bot Framework connectors were removed in version 5.

**- How do I build a multilanguage chatbot?** Install the package for each language and add
it as a plugin: [Adding multilanguage](./quickstart.md#adding-multilanguage).

**- Do I need to install the languages separately when using `node-nlp-neo`?** No, it
depends on `@nlpjs-neo/lang-all`, which mounts every language.

**- Where do I see the languages and their locales?** In
[Language Support](./language-support.md); the ones marked with Native Support have a
tokenizer and a stemmer.

**- How does the NLP guess the language of an utterance?** With the most common trigrams of
each language, plus the trigrams of the corpus it was trained with, so even invented
languages are guessed if you trained them.

**- How do I guess the language of a sentence without the NLP?** See the
[language guesser](./language-guesser.md). Use `@nlpjs-neo/language` instead of
`node-nlp-neo` if you want a smaller dependency.

**- When an intent is triggered I want to get the answer from an API call.** Use a pipeline
that reacts to the intent: [Adding logic to an intent](./quickstart.md#adding-logic-to-an-intent),
or one of the other hooks in [NLP intent logics](./nlp-intent-logics.md).

**- How do I use the NER?** Directly from the `NlpManager`:

```js
import { NlpManager } from 'node-nlp-neo';

const manager = new NlpManager({ languages: ['en'], forceNER: true });
manager.addNamedEntityText('hero', 'spiderman', ['en'], ['Spiderman', 'Spider-man']);
manager.addNamedEntityText('hero', 'iron man', ['en'], ['iron man', 'iron-man']);
manager.addNamedEntityText('hero', 'thor', ['en'], ['Thor']);
manager.addNamedEntityText('food', 'burguer', ['en'], ['Burguer', 'Hamburguer']);
manager.addNamedEntityText('food', 'pizza', ['en'], ['pizza']);
manager.addNamedEntityText('food', 'pasta', ['en'], ['Pasta', 'spaghetti']);

const result = await manager.process('I saw spederman eating speghetti in the city');
console.log(result);
```

**- This is not extracting the entities.** Set `forceNER` to true when you create the
`NlpManager`. This activates the NER even if you have no entities associated to intents.

```js
const manager = new NlpManager({ languages: ['en'], forceNER: true });
```

**- The enum entity extraction is slow.** The default NER threshold is 0.8, which allows
users to make mistakes when they write, but makes identifying entities much heavier. Set the
threshold to 1 for exact matching:

```js
const manager = new NlpManager({ languages: ['en'], forceNER: true, ner: { threshold: 1 } });
```

With a threshold of 1 the match is done with a dictionary instead of Levenshtein distance,
so millions of possible values are searched in milliseconds.

**- The builtin entity extraction is slow.** By default it uses
[Microsoft Recognizers](https://github.com/microsoft/Recognizers-Text), which relies on
computationally expensive regular expressions. The alternative is
[Duckling](./builtin-duckling.md), which needs a Duckling instance up and running and is
reached over its API.

**- Builtin entity extraction only works in a few languages.** That is the Microsoft
Recognizers coverage; see [builtin entity extraction](./builtin-entity-extraction.md) for
the table. [Duckling](./builtin-duckling.md) covers more languages.

**- How do I use enum entities?** [NER Manager, enum entities](./ner-manager.md#enum-entities).

**- How do I search entities by regular expressions?**
[NER Manager, regex entities](./ner-manager.md#regex-entities).

**- What builtin (golden) entities can I extract?**
[Builtin entity extraction](./builtin-entity-extraction.md).

**- I want to go low level and use only the neural network to classify.** See
[NeuralNetwork](./neural.md) and the examples in
[`examples/08-neural-network`](../../examples/08-neural-network).

**- I want to calculate the Levenshtein distance of two strings.** Use `similarity`. The
third parameter defaults to `false`; set it to `true` to normalize both strings first.

```js
import { similarity } from '@nlpjs-neo/similarity';

console.log(similarity('potatoe', 'potatoe'));
console.log(similarity('potatoe', 'potatoes'));
console.log(similarity('potatoe', 'potsatoe'));
console.log(similarity('potatoe', 'poattoe'));
console.log(similarity('potatoe', 'postatoé', true));
console.log(similarity('potatoe', 'Postatoé', true));
```

**- Given a text, I want the best substring matching a string.** Use `getBestSubstring` from
the `ExtractorEnum` of the NER package:

```js
import { ExtractorEnum } from '@nlpjs-neo/ner';

const text =
  'Morbi ainterd multricies neque varius condimentum. Donec volutpat turpis interdum metus ultricies vulputate.';
const str = 'interdum ultricies';

const extractor = new ExtractorEnum();
const result = extractor.getBestSubstring(text, str);
console.log(result);
```
