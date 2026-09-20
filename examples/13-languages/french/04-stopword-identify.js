import { StopwordsFr } from '../../../packages/lang-fr/src/index.js';

const stopwords = new StopwordsFr();
console.log(stopwords.isStopword('pas'));
// output: true
console.log(stopwords.isStopword('est'));
// output: true
console.log(stopwords.isStopword('developpeur'));
// output: false
