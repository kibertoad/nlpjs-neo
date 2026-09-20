import { StopwordsFr } from '../../../packages/lang-fr/src/index.js';

const stopwords = new StopwordsFr();
console.log(stopwords.removeStopwords(['qui', 'est', 'grand', 'et', 'mature']));
// output: ['grand', 'mature']
