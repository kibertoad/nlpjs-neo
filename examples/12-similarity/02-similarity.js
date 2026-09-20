import { similarity } from '../../packages/similarity/src/index.js';
// import { similarity } from '@nlpjs-neo/similarity';

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
