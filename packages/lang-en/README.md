![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/lang-en

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/lang-en.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/lang-en)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/lang-en.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/lang-en)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## TABLE OF CONTENTS

<!--ts-->

- [Installation](#installation)
- [Normalization](#normalization)
- [Tokenization](#tokenization)
- [Identify if a word is an english stopword](#identify-if-a-word-is-an-english-stopword)
- [Remove stopwords from an array of words](#remove-stopwords-from-an-array-of-words)
- [Change the stopwords dictionary](#change-the-stopwords-dictionary)
- [Stemming word by word](#stemming-word-by-word)
- [Stemming an array of words](#stemming-an-array-of-words)
- [Normalizing, Tokenizing and Stemming a sentence](#normalizing-tokenizing-and-stemming-a-sentence)
- [Remove stopwords when stemming a sentence](#remove-stopwords-when-stemming-a-sentence)
- [Sentiment Analysis](#sentiment-analysis)
- [Example of usage on a classifier](#example-of-usage-on-a-classifier)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Who is behind it](#who-is-behind-it)
- [License](#license)
  <!--te-->

## Installation

You can install @nlpjs-neo/lang-en:

```bash
    pnpm add @nlpjs-neo/lang-en
```

## Normalization

Normalization of a text converts it to lowercase and remove decorations of characters.

```javascript
import { NormalizerEn } from '@nlpjs-neo/lang-en';

const normalizer = new NormalizerEn();
const input = 'This shóuld be normalized';
const result = normalizer.normalize(input);
console.log(result);
// output: this should be normalized
```

## Tokenization

Tokenization splits a sentence into words.

```javascript
import { TokenizerEn } from '@nlpjs-neo/lang-en';

const tokenizer = new TokenizerEn();
const input = 'This isn\'t tokenized yet';
const result = tokenizer.tokenize(input);
console.log(result);
// output: [ 'This', 'is', 'not', 'tokenized', 'yet' ]
```

Tokenizer can also normalize the sentence before tokenizing, to do that provide a _true_ as second argument to the method _tokenize_

```javascript
import { TokenizerEn } from '@nlpjs-neo/lang-en';

const tokenizer = new TokenizerEn();
const input = 'This isn\'t tokenized yet';
const result = tokenizer.tokenize(input true);
console.log(result);
// output: [ 'this', 'is', 'not', 'tokenized', 'yet' ]
```

## Identify if a word is an english stopword

Using the class _StopwordsEn_ you can identify if a word is an stopword:

```javascript
import { StopwordsEn } from '@nlpjs-neo/lang-en';

const stopwords = new StopwordsEn();
console.log(stopwords.isStopword('is'));
// output: true
console.log(stopwords.isStopword('developer'));
// output: false
```

## Remove stopwords from an array of words

Using the class _StopwordsEn_ you can remove stopwords form an array of words:

```javascript
import { StopwordsEn } from '@nlpjs-neo/lang-en';

const stopwords = new StopwordsEn();
console.log(stopwords.removeStopwords(['who', 'is', 'your', 'develop']));
// output: ['develop']
```

## Change the stopwords dictionary
Using the class _StopwordsEn_ you can restart it dictionary and build it from another set of words:

```javascript
import { StopwordsEn } from '@nlpjs-neo/lang-en';

const stopwords = new StopwordsEn();
stopwords.dictionary = {};
stopwords.build(['is', 'your']);
console.log(stopwords.removeStopwords(['who', 'is', 'your', 'develop']));
// output: ['who', 'develop']
```

## Stemming word by word

An stemmer is an algorithm to calculate the _stem_ (root) of a word, removing affixes. 

You can stem one word using method _stemWord_:

```javascript
import { StemmerEn } from '@nlpjs-neo/lang-en';

const stemmer = new StemmerEn();
const input = 'developer';
console.log(stemmer.stemWord(input));
// output: develop
```

## Stemming an array of words

You can stem an array of words using method _stem_:

```javascript
import { StemmerEn } from '@nlpjs-neo/lang-en';

const stemmer = new StemmerEn();
const input = ['Who', 'is', 'your', 'developer'];
console.log(stemmer.stem(input));
// outuput: [ 'Who', 'is', 'your', 'develop' ]
```

## Normalizing, Tokenizing and Stemming a sentence

As you can see, stemmer does not do internal normalization, so words with uppercases will remain uppercased. 
Also, stemmer works with lowercased affixes, so _developer_ will be stemmed as _develop_ but _DEVELOPER_ will not be changed.

You can tokenize and stem a sentence, including normalization, with the method _tokenizeAndStem_:

```javascript
import { StemmerEn } from '@nlpjs-neo/lang-en';

const stemmer = new StemmerEn();
const input = 'Who is your DEVELOPER';
console.log(stemmer.tokenizeAndStem(input));
// output: [ 'who', 'is', 'your', 'develop' ]
```

## Remove stopwords when stemming a sentence

When calling _tokenizeAndStem_ method from the class _StemmerEn_, the second parameter is a boolean to set if the stemmer must keep the stopwords (true) or remove them (false). Before using it, the stopwords instance must be set into the stemmer:

```javascript
import { StemmerEn, StopwordsEn } from '@nlpjs-neo/lang-en';

const stemmer = new StemmerEn();
stemmer.stopwords = new StopwordsEn();
const input = 'who is your developer';
console.log(stemmer.tokenizeAndStem(input, false));
// output: ['develop']
```

## Sentiment Analysis

To use sentiment analysis you'll need to create a new _Container_ and use the plugin _LangEn_, because internally the _SentimentAnalyzer_ class try to retrieve the normalizer, tokenizer, stemmmer and sentiment dictionaries from the container.

```javascript
import { Container } from '@nlpjs-neo/core';
import { SentimentAnalyzer } from '@nlpjs-neo/sentiment';
import { LangEn } from '@nlpjs-neo/lang-en';

(async () => {
  const container = new Container();
  container.use(LangEn);
  const sentiment = new SentimentAnalyzer({ container });
  const result = await sentiment.process({ locale: 'en', text: 'I love cats'});
  console.log(result.sentiment);
})();
// output:
// {                              
//   score: 0.5,                  
//   numWords: 3,                 
//   numHits: 1,                  
//   average: 0.16666666666666666,
//   type: 'senticon',            
//   locale: 'en',                
//   vote: 'positive'             
// }                              
```

The output of the sentiment analysis includes:
- *score*: final score of the sentence. 
- *numWords*: total words of the sentence.
- *numHits*: total words of the sentence identified as having a sentiment score.
- *average*: score divided by numWords
- *type*: type of dictionary used, values can be afinn, senticon or pattern.
- *locale*: locale of the sentence
- *vote*: positive if score greater than 0, negative if score lower than 0, neutral if score equals 0.

## Example of usage on a classifier

```javascript
import { containerBootstrap } from '@nlpjs-neo/core';
import { Nlp } from '@nlpjs-neo/nlp';
import { LangEn } from '@nlpjs-neo/lang-en';

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
