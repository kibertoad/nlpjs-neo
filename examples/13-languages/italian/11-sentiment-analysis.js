import { Container } from '../../../packages/core/src/index.js';
import { SentimentAnalyzer } from '../../../packages/sentiment/src/index.js';
import { LangIt } from '../../../packages/lang-it/src/index.js';
// import { Container } from '@nlpjs-neo/core';
// import { SentimentAnalyzer } from '@nlpjs-neo/sentiment';
// import { LangIt } from '@nlpjs-neo/lang-it';

(async () => {
  const container = new Container();
  container.use(LangIt);
  const sentiment = new SentimentAnalyzer({ container });
  const result = await sentiment.process({
    locale: 'it',
    text: 'amore per i gatti',
  });
  console.log(result.sentiment);
})();
// output:
// {
//   score: 0.25,
//   numWords: 4,
//   numHits: 2,
//   average: 0.0625,
//   type: 'pattern',
//   locale: 'it',
//   vote: 'positive'
// }
