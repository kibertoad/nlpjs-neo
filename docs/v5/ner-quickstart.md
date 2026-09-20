# NER Quick Start

## Install the needed packages

In your node project folder, install the @nlpjs-neo/basic package.
```bash
pnpm add @nlpjs-neo/basic
```

## Create the conf.json

Create the file _conf.json_ with this content:

```json
{
  "settings": {
    "nlp": {
      "corpora": ["./corpus.json"]
    }
  },
  "use": ["Basic", "LangEn", "ConsoleConnector"]
}
```

You are telling the application to use 3 plugins:
- Basic: the basic plugins for an NLP backend, that includes evaluator, javascript compiler, logger, and NLP classes
- LangEn: the plugin to use English language
- ConsoleConnector: the plugin that lets you talk with the chatbot from the terminal

Finally, it tells the NLP to import the corpus defined in the file _corpus.json_.

## Create the corpus.json

Add the file _corpus.json_ with this content:

```json
{
  "name": "Corpus with entities",
  "locale": "en-US",
  "contextData": "./heros.json",
  "data": [
    {
      "intent": "hero.realname",
      "utterances": [
        "what is the real name of @hero"
      ],
      "answers": [
        "The real name of {{ hero }} is {{ _data[entities.hero.option].realName }}"
      ]
    },
    {
      "intent": "hero.city",
      "utterances": [
        "where @hero lives?",
        "what's the city of @hero?"
      ],
      "answers": [
        "{{ hero }} lives at {{ _data[entities.hero.option].city }}"
      ]
    }
  ],
  "entities": {
    "hero": {
      "options": {
        "spiderman": ["spiderman", "spider-man"],
        "ironman": ["ironman", "iron-man"],
        "thor": ["thor"]
      }
    }
  }
}
```

This creates 2 intents: one to know the real name of a hero and other one to know where the hero lives.
It also creates the entity to recognize the heros: spiderman, ironman and thor, and also their synonyms.
There is a part in the json to tell the NLP to load some contextData that will be used to generate the answers:
```json
  "contextData": "./heros.json",
```

If you take a look at one answer, ```_data[entities.hero.option].city``` as an example, the content at the json _heros.json_ will be accessible in the context as data. Also, the entities are accessible in the property _entities_, so because the entity name is _hero_ you'll have the result from the NER for the entity _hero_ stored in _entities.hero_

## Create the heros.json

Create the file _heros.json_ with this content:

```json
{
  "spiderman": {
    "realName": "Peter Parker",
    "city": "Queens, New York"
  },
  "ironman": {
    "realName": "Tony Stark",
    "city": "Stark Tower, New York"
  },
  "thor": {
    "realName": "Odinson",
    "city": "Asgard"
  }
}
```

## Create the pipelines.md

Create the file _pipelines.md_ with this content:

```markdown
# default

## main
nlp.train
console.say "Say something!"

## console.hear
// compiler=javascript
if (message === 'quit') {
  return console.exit();
}
nlp.process();
this.say();
```

The _main_ pipeline trains the NLP and greets you when the application starts.
The _console.hear_ pipeline is the one executed every time the console connector
hears something: it exits when you type "quit", and otherwise sends what you
wrote through the NLP and says the answer back.

## Create the index.js

Create the file _index.js_ with this content:

```javascript
import { dockStart } from '@nlpjs-neo/basic';

(async () => {
  await dockStart();
})();
```

This initializes the project and loads all the jsons. It also builds the structure when you call _dockStart()_ and then it returns a dock for the containers.

## Start the application

You can start your application running:

```shell
node index.js
```

Then you can talk with the bot in your terminal, and type "quit" to leave.

## Stored context

You'll see that you can ask for information about a hero, but also that if you're talking with the bot about a hero then you can omit the reference to the hero you're talking about.
This context is stored per conversation, so different conversations have their own context variables.
