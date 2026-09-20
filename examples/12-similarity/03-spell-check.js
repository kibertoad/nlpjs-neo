import { SpellCheck } from '../../packages/similarity/src/index.js';
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
