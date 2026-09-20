import { leven } from '../../packages/similarity/src/index.js';
// import { leven } from '@nlpjs-neo/similarity';

console.log(leven('potatoe', 'potatoe')); // expected: 0
console.log(leven('distance', 'eistancd')); // expected: 2
console.log(leven('mikailovitch', 'Mikhaïlovitch')); // expected: 3
