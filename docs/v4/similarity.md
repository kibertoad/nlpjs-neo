# @nlpjs-neo/similarity

## TABLE OF CONTENTS

<!--ts-->

- [Installation](#installation)
- [leven](#leven)
- [similarity](#similarity)
- [SpellCheck](#spellcheck)
- [SpellCheck trained with words trained from a text](#spellcheck-trained-with-words-trained-from-a-text)

<!--te-->

## Installation

You can install @nlpjs-neo/similarity:

```bash
    pnpm add @nlpjs-neo/similarity
```

## leven

Leven is used to calculate the levenshtein distance between two texts:

```javascript
import { leven } from '@nlpjs-neo/similarity';

console.log(leven('potatoe', 'potatoe')); // expected: 0
console.log(leven('distance', 'eistancd')); // expected: 2
console.log(leven('mikailovitch', 'Mikhaïlovitch')); // expected: 3
```

## similarity

similarity is used to calculate the levenshtein distance between two texts, but with an option to normalize both texts between calculation.

```javascript
import { similarity } from '@nlpjs-neo/similarity';

function showDistances(word1, word2) {
  console.log(`"${word1}" vs "${word2}" :`);
  console.log(`    similarity (non normalized): ${similarity(word1, word2)}`);
  console.log(
    `        similarity (normalized): ${similarity(word1, word2, true)}`
  );
}

showDistances('potatoe', 'potatoe');
showDistances('potatoe', 'Potatoe');
showDistances('distance', 'eistancd');
showDistances('mikailovitch', 'Mikhaïlovitch');
```

## SpellCheck

SpellCheck can do a spell check based on a dictionary of words with frequency.
It searches for the most similar word based on a levenshtein distance. When several words have the same levenshtein distance, the word with more frequency is chosen.

```javascript
import { SpellCheck } from '../../packages/similarity/src';
// import { SpellCheck } from '@nlpjs-neo/similarity';

const spellCheck = new SpellCheck({
  features: {
    wording: 1,
    worming: 4,
    working: 3,
  },
});
const actual = spellCheck.check(['worling'], 1);
console.log(actual);
```

## SpellCheck trained with words trained from a text

```javascript
import fs from 'fs';
import { SpellCheck } from '@nlpjs-neo/similarity';
import { NGrams } from '@nlpjs-neo/utils';

// File book.txt should contain the text that contains the words to be learnt. 
// In the example we used Pride and Prejudice from Project Gutenberg 
const lines = fs.readFileSync('./data/book.txt', 'utf-8').split(/\r?\n/);
const ngrams = new NGrams({ byWord: true });
const freqs = ngrams.getNGramsFreqs(lines, 1);
const spellCheck = new SpellCheck({ features: freqs });
const actual = spellCheck.check(['knowldge', 'thas', 'prejudize']);
console.log(actual);
```
