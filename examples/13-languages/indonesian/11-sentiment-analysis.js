import { Container } from '../../../packages/core/src/index.js';
import { SentimentAnalyzer } from '../../../packages/sentiment/src/index.js';
import { LangId } from '../../../packages/lang-id/src/index.js';
// import { Container } from '@nlpjs-neo/core';
// import { SentimentAnalyzer } from '@nlpjs-neo/sentiment';
// import { LangId } from '@nlpjs-neo/lang-id';

(async () => {
  const container = new Container();
  container.use(LangId);
  const sentiment = new SentimentAnalyzer({ container });
  const result = await sentiment.process({
    locale: 'id',
    text: 'kucing itu mengagumkan',
  });
  console.log(result.sentiment);
})();
// output:
// {
//   score: 4,
//   numWords: 3,
//   numHits: 1,
//   average: 1.3333333333333333,
//   type: 'afinn',
//   locale: 'id',
//   vote: 'positive'
// }
