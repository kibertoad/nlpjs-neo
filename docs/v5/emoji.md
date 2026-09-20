# @nlpjs-neo/emoji

## Introduction

@nlpjs-neo/emoji is the package that adds the function _removeEmojis_ which replaces emojis with their text equivalents.

## Installing

_removeEmojis_ is a function in the package _@nlpjs-neo/emoji_, which you can install via NPM:

```bash
  pnpm add @nlpjs-neo/emoji
```

## Example of use

```javascript
import { removeEmojis } from '@nlpjs-neo/emoji';

const actual = removeEmojis('I ❤️  ☕️! -  😯⭐️😍  ::: test : : 👍+');
console.log(actual);
// I :heart:  :coffee:! -  :hushed::star::heart_eyes:  ::: test : : :thumbsup:+
```
