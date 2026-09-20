# Quick Start

This walks through building a bot from a handful of lines up to a configuration-driven one.
Every step below has a runnable counterpart in the [`examples/`](../../examples) folder.

## Install the library
At the folder where is your node project, install the basic library, that will install the core and basic plugins for working in backend.

```bash
pnpm add @nlpjs-neo/basic
```

## Create the code
Then you can create a file called index.js with this content:

```javascript
import { dockStart } from '@nlpjs-neo/basic';

(async () => {
  const dock = await dockStart({ use: ['Basic']});
  const nlp = dock.get('nlp');
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

## Extracting the corpus into a file
You can create the corpus as json files. The format of the json is:

```json
{
  "name": "Name of the corpus",
  "locale": "en-US",
  "data": [
    {
      "intent": "agent.birthday",
      "utterances": [
        "when is your birthday",
        "when do you celebrate your birthday",
        "when were you born",
        "when do you have birthday",
        "date of your birthday"
      ],
      "answers": [
        "Wait, are you planning a party for me? It's today! My birthday is today!",
        "I'm young. I'm not sure of my birth date",
        "I don't know my birth date. Most virtual agents are young, though, like me."
      ]
    },
    ...
  ]
}
```

So the new code will be: 

```javascript
import { dockStart } from '@nlpjs-neo/basic';

(async () => {
  const dock = await dockStart({ use: ['Basic']});
  const nlp = dock.get('nlp');
  await nlp.addCorpus('./corpus-en.json');
  await nlp.train();
  const response = await nlp.process('en', 'Who are you');
  console.log(response);
})();
```

## Extracting the configuration into a file

Now we can remove things that are configuration into a file. 

Add a _conf.json_ file with this content:

```json
{
  "settings": {
    "nlp": {
      "corpora": [
        "./corpus-en.json"
      ]
    }
  },
  "use": ["Basic"]
}
```

And the new code will be:
```javascript
import { dockStart } from '@nlpjs-neo/basic';

(async () => {
  const dock = await dockStart();
  const nlp = dock.get('nlp');
  await nlp.train();
  const response = await nlp.process('en', 'Who are you');
  console.log(response);
})();
```

As you can see now we don't need to provide the plugins to dockStart, nor do we need to add the corpus manually.

## Creating your first pipeline

Now create a _pipelines.md_ file with this content:
```markdown
# default

## main
nlp.train
```

And remove the nlp.train() from the code:
```javascript
import { dockStart } from '@nlpjs-neo/basic';

(async () => {
  const dock = await dockStart();
  const nlp = dock.get('nlp');
  const response = await nlp.process('en', 'Who are you');
  console.log(response);
})();
```

We are defining a pipeline called _main_ and it will be executed after loading the configuration and mounting the plugins, so the train process will be executed automatically in the dockStart process.

## Adding your first connector
A runnable version of this step is in [`examples/11-console-connector`](../../examples/11-console-connector).
Now modify the _conf.json_ to also use the plugin called _ConsoleConnector_:

```json
{
  "settings": {
    "nlp": {
      "corpora": [
        "./corpus-en.json"
      ]
    }
  },
  "use": ["Basic", "ConsoleConnector"]
}
```

And in the _index.js_ you will only need the dockStart:

```javascript
import { dockStart } from '@nlpjs-neo/basic';

(async () => {
  await dockStart();
})();
```

Now when you execute you can talk with your bot in the terminal, read the corpus to know what you can ask your bot.

## Extending your bot with the pipeline
A runnable version of this step is in [`examples/03-qna-pipelines`](../../examples/03-qna-pipelines).
Now we will do two modifications: 
The first if for our chatbot to write "Say something!" in the console when it starts.
To do that, we can change the pipeline _main_

```markdown
# default

## main
nlp.train
console.say "Say something!"
```

Also, we want the console to quit the chat process when we type "quit". 
To end the process, the console plugin has a method called _exit_. 
And we want to write the code in the pipeline in javascript, so this is what we add to the _pipelines.md_ file:

```markdown
## console.hear
// compiler=javascript
if (message === 'quit') {
  return console.exit();
}
nlp.process();
this.say();
```

To explain the pipeline better: 
- The name of the pipeline is _console.hear_ because it's the name of the event that the console connector will raise when it hears something. If this event does not exists in the pipeline, then it will do the default action. The code inside the pipeline will be executed with the input that this method receives.
- The line "// compiler=javascript" is specifying which compiler to use for the pipeline. The default compiler is very simple, but you can also write your pipelines in javascript. Compilers are plugins, so support for another language can be added as one.
- "nlp.process()" is calling the _process_ method of the plugin _nlp_. Notable here: this method returns a promise but you don't need to put the await in the pipelines, the await is automatically done. Also, no arguments are being provided: when the pipeline javascript compiler finds a method where we do not pass any argument, by default it adds the current input of the pipeline.
- "this.say()" as the _console.hear_ is executed by the _console_ plugin, _this_ refers to this plugin. As in the "nlp.process" we are not providing arguments, so the input is automatically provided.

The _index.js_ file will be:

```javascript
import { dockStart } from '@nlpjs-neo/basic';

(async () => {
  await dockStart();
})();
```

## Adding Multilanguage
A runnable version of this step is in [`examples/13-languages`](../../examples/13-languages).
Now we want to add a corpus in spanish. First at all we must install the spanish language plugin:
```bash
pnpm add @nlpjs-neo/lang-es
```

Then add the _LangEs_ plugin in the configuration, and of course the corpus to the corpora:
```json
{
  "settings": {
    "nlp": {
      "corpora": [
        "./corpus-en.json",
        "./corpus-es.json"
      ]
    }
  },
  "use": ["Basic", "LangEs", "ConsoleConnector"]
}
```

And add an Spanish corpus. In the example, the Spanish corpus does not have answers, and the default behaviour of ConsoleConnector is to do an echo. To show the intent and the score in the console, we can add the property debug to the console settings, and set the value to true, modifying the configuration as follows:
```json
{
  "settings": {
    "nlp": {
      "corpora": [
        "./corpus-en.json",
        "./corpus-es.json"
      ]
    },
    "console": {
      "debug": true
    }
  },
  "use": ["Basic", "LangEs", "ConsoleConnector"]
}
```

Now when you talk with the chatbot you can ask questions from the English corpus or from the Spanish corpus. The NLP process will automatically identify the language and send the utterance to the correct trained model.

## Recognizing the bot name and the channel

With the last code, try this sentence in the console: "where am I".
You'll notice that the answer is something like: "you're talking from console, app is default channel is console"
This happens because the answers to this intents are written like this:
```json
      "answers": [
        { "answer": "you're talking from console, app is {{ app }} channel is {{ channel }}", "opts": "channel==='console'" },
        { "answer": "you're talking from somewhere else, app is {{ app }} channel is {{ channel }}", "opts": "channel!=='console'" }
      ]
```
Here we are mixing two things:
1. The context variables: _{{ app }}_ and _{{ channel }}_ will be replaced by the context variables app (bot name) and channel (channel name).
2. Opts: the opts for an answer are the conditions to return this answer, and can be any condition in javascript format.

## Adding logic to an intent
Suppose that you want to have an intent for telling jokes about Chuck Norris, and you know that a service that returns random Chuck Norris jokes exists: https://api.chucknorris.io/jokes/random

First you need to add the intent to the corpus:
```json
    {
      "intent": "joke.chucknorris",
      "utterances": [
        "tell me a chuck norris fact",
        "tell me a joke about chuck norris",
        "say a chuck norris joke",
        "some chuck norris fact"
      ]
    },
```

Then add this to the _pipelines.md_ in the default section:

```markdown
## onIntent(joke.chucknorris)
// compiler=javascript
const something = request.get('https://api.chucknorris.io/jokes/random');
if (something && something.value) {
  input.answer = something.value;
}
```

Explanation: the _onIntent(<intentname>)_ is called when an intent is recognized, so you can react to doing things and modifying the input as you want, from classifications, entities and of course the answer.
We set the compiler to JavaScript. 
We have a plugin _request_ that is for handling requests, then we call the API to retrieve an answer, and set it in the input.

![Chuck Norris intent in the console](../../screenshots/chucknorris.png)
