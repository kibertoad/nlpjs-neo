import { StopwordsFr } from '../../../packages/lang-fr/src/index.js';

const stopwords = new StopwordsFr();
stopwords.dictionary = {};
stopwords.build(['a', 'et']);
console.log(stopwords.removeStopwords(['on', 'a', 'et', 'mange']));
// output: [ 'on', 'mange' ]
