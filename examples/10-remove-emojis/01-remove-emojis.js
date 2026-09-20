import { removeEmojis } from '../../packages/emoji/src/index.js';
// import { removeEmojis } from '@nlpjs-neo/emoji';

const actual = removeEmojis('I ❤️  ☕️! -  😯⭐️😍  ::: test : : 👍+');
console.log(actual);
