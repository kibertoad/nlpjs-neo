import { StopwordsEs } from '../../../packages/lang-es/src/index.js';
// import { StopwordsEs } from '@nlpjs-neo/lang-es';

const stopwords = new StopwordsEs();
stopwords.dictionary = {};
stopwords.build(['he', 'visto']);
console.log(
  stopwords.removeStopwords(['he', 'visto', 'a', 'un', 'programador'])
);
// output: ['a', 'un', 'programador']
