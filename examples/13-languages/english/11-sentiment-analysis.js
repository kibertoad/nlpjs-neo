import { Container } from '../../../packages/core/src/index.js';
import { SentimentAnalyzer } from '../../../packages/sentiment/src/index.js';
import { LangEn } from '../../../packages/lang-en/src/index.js';
// import { Container } from '@nlpjs-neo/core';
// import { SentimentAnalyzer } from '@nlpjs-neo/sentiment';
// import { LangEn } from '@nlpjs-neo/lang-en';

(async () => {
  const container = new Container();
  container.use(LangEn);
  const sentiment = new SentimentAnalyzer({ container });
  const result = await sentiment.process({ locale: 'en', text: 'I love cats' });
  console.log(result.sentiment);
})();
// output:
// {
//   score: 0.5,
//   numWords: 3,
//   numHits: 1,
//   average: 0.16666666666666666,
//   type: 'senticon',
//   locale: 'en',
//   vote: 'positive'
// }
