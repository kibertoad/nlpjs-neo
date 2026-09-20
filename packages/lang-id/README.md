![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/lang-id

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/lang-id.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/lang-id)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/lang-id.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/lang-id)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## TABLE OF CONTENTS

<!--ts-->

- [Installation](#installation)
- [Normalization](#normalization)
- [Tokenization](#tokenization)
- [Identify if a word is an indonesian stopword](#identify-if-a-word-is-an-indonesian-stopword)
- [Remove stopwords from an array of words](#remove-stopwords-from-an-array-of-words)
- [Change the stopwords dictionary](#change-the-stopwords-dictionary)
- [Stemming word by word](#stemming-word-by-word)
- [Stemming an array of words](#stemming-an-array-of-words)
- [Normalizing, Tokenizing and Stemming a sentence](#normalizing-tokenizing-and-stemming-a-sentence)
- [Remove stopwords when stemming a sentence](#remove-stopwords-when-stemming-a-sentence)
- [Sentiment Analysis](#sentiment-analysis)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Who is behind it](#who-is-behind-it)
- [License](#license)
  <!--te-->

## Installation

You can install @nlpjs-neo/lang-id:

```bash
    pnpm add @nlpjs-neo/lang-id
```

## Normalization

Normalization of a text converts it to lowercase and remove decorations of characters.

```javascript
import { NormalizerId } from '@nlpjs-neo/lang-id';

const normalizer = new NormalizerId();
const input = 'apa yang dikembangkan perúsahaan Anda';
const result = normalizer.normalize(input);
console.log(result);
// output: apa yang dikembangkan perusahaan anda
```

## Tokenization

Tokenization splits a sentence into words.

```javascript
import { TokenizerId } from '@nlpjs-neo/lang-id';

const tokenizer = new TokenizerId();
const input = 'apa yang dikembangkan perusahaan Anda';
const result = tokenizer.tokenize(input);
console.log(result);
// output: [ 'apa', 'yang', 'dikembangkan', 'perusahaan', 'Anda' ]
```

Tokenizer can also normalize the sentence before tokenizing, to do that provide a _true_ as second argument to the method _tokenize_

```javascript
import { TokenizerId } from '@nlpjs-neo/lang-id';

const tokenizer = new TokenizerId();
const input = 'apa yang dikembangkan perusahaan Anda';
const result = tokenizer.tokenize(input, true);
console.log(result);
// output: [ 'apa', 'yang', 'dikembangkan', 'perusahaan', 'anda' ]
```

## Identify if a word is an indonesian stopword

Using the class _StopwordsId_ you can identify if a word is an stopword:

```javascript
import { StopwordsId } from '@nlpjs-neo/lang-id';

const stopwords = new StopwordsId();
console.log(stopwords.isStopword('apa'));
// output: true
console.log(stopwords.isStopword('perusahaan'));
// output: false
```

## Remove stopwords from an array of words

Using the class _StopwordsId_ you can remove stopwords form an array of words:

```javascript
import { StopwordsId } from '@nlpjs-neo/lang-id';

const stopwords = new StopwordsId();
console.log(
  stopwords.removeStopwords([
    'apa',
    'yang',
    'dikembangkan',
    'perusahaan',
    'anda',
  ])
);
// output: [ 'dikembangkan', 'perusahaan' ]
```

## Change the stopwords dictionary
Using the class _StopwordsId_ you can restart it dictionary and build it from another set of words:

```javascript
import { StopwordsId } from '@nlpjs-neo/lang-id';

const stopwords = new StopwordsId();
stopwords.dictionary = {};
stopwords.build(['apa', 'anda']);
console.log(
  stopwords.removeStopwords([
    'apa',
    'yang',
    'dikembangkan',
    'perusahaan',
    'anda',
  ])
);
// output: [ 'yang', 'dikembangkan', 'perusahaan' ]
```

## Stemming word by word

An stemmer is an algorithm to calculate the _stem_ (root) of a word, removing affixes. 

You can stem one word using method _stemWord_:

```javascript
import { StemmerId } from '@nlpjs-neo/lang-id';

const stemmer = new StemmerId();
const input = 'dikembangkan';
console.log(stemmer.stemWord(input));
// output: kembang
```

## Stemming an array of words

You can stem an array of words using method _stem_:

```javascript
import { StemmerId } from '@nlpjs-neo/lang-id';

const stemmer = new StemmerId();
const input = ['apa', 'yang', 'dikembangkan', 'perusahaan', 'Anda'];
console.log(stemmer.stem(input));
// outuput: [ 'apa', 'yang', 'kembang', 'usaha', 'Anda' ]
```

## Normalizing, Tokenizing and Stemming a sentence

As you can see, stemmer does not do internal normalization, so words with uppercases will remain uppercased. 
Also, stemmer works with lowercased affixes, so _perusahaan_ will be stemmed as _usaha_ but _PERUSAHAAN_ will not be changed.

You can tokenize and stem a sentence, including normalization, with the method _tokenizeAndStem_:

```javascript
import { StemmerId } from '@nlpjs-neo/lang-id';

const stemmer = new StemmerId();
const input = 'apa yang dikembangkan PERUSAHAAN Anda';
console.log(stemmer.tokenizeAndStem(input));
// output: [ 'apa', 'yang', 'kembang', 'usaha', 'anda' ]
```

## Remove stopwords when stemming a sentence

When calling _tokenizeAndStem_ method from the class _StemmerId_, the second parameter is a boolean to set if the stemmer must keep the stopwords (true) or remove them (false). Before using it, the stopwords instance must be set into the stemmer:

```javascript
import { StemmerId, StopwordsId } from '@nlpjs-neo/lang-id';

const stemmer = new StemmerId();
stemmer.stopwords = new StopwordsId();
const input = 'apa yang dikembangkan perusahaan Anda';
console.log(stemmer.tokenizeAndStem(input, false));
// output: [ 'kembang', 'usaha' ]
```

## Sentiment Analysis

To use sentiment analysis you'll need to create a new _Container_ and use the plugin _LangId_, because internally the _SentimentAnalyzer_ class try to retrieve the normalizer, tokenizer, stemmmer and sentiment dictionaries from the container.

```javascript
import { Container } from '@nlpjs-neo/core';
import { SentimentAnalyzer } from '@nlpjs-neo/sentiment';
import { LangId } from '@nlpjs-neo/lang-id';

(async () => {
  const container = new Container();
  container.use(LangId);
  const sentiment = new SentimentAnalyzer({ container });
  const result = await sentiment.process({
    locale: 'id',
    text: 'kucing itu mengagumkan',
  });
  console.log(result.sentiment);
})();
// output:
// {
//   score: 4,
//   numWords: 3,
//   numHits: 1,
//   average: 1.3333333333333333,
//   type: 'afinn',
//   locale: 'id',
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
