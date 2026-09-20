![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/similarity

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/similarity.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/similarity)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/similarity.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/similarity)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## TABLE OF CONTENTS

<!--ts-->

- [Installation](#installation)
- [leven](#leven)
- [similarity](#similarity)
- [SpellCheck](#spellcheck)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [Who is behind it](#who-is-behind-it)
- [License](#license)

<!--te-->

## Installation

You can install @nlpjs-neo/similarity:

```bash
    pnpm add @nlpjs-neo/similarity
```

## leven

It's used to calculate the levenshtein distance between two texts:

```javascript
import { leven } from '@nlpjs-neo/similarity';

console.log(leven('potatoe', 'potatoe')); // expected: 0
console.log(leven('distance', 'eistancd')); // expected: 2
console.log(leven('mikailovitch', 'Mikhaïlovitch')); // expected: 3
```

## similarity

It's used to calculate the levenshtein distance between two texts, but with an option to normalize both texts between calculation.

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

It can do spell check based on a dictionary of words with frequency.
It search for the most similar word based on levenshtein distance. When several words has the same levenshtein distance, the word with more frequency is chosen.

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
