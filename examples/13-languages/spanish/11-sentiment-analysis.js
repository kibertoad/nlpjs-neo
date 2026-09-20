import { Container } from '../../../packages/core/src/index.js';
import { SentimentAnalyzer } from '../../../packages/sentiment/src/index.js';
import { LangEs } from '../../../packages/lang-es/src/index.js';
// import { Container } from '@nlpjs-neo/core';
// import { SentimentAnalyzer } from '@nlpjs-neo/sentiment';
// import { LangEs } from '@nlpjs-neo/lang-es';

(async () => {
  const container = new Container();
  container.use(LangEs);
  const sentiment = new SentimentAnalyzer({ container });
  const result = await sentiment.process({
    locale: 'es',
    text: 'me gustan los gatos',
  });
  console.log(result.sentiment);
})();
// output:
// {
//   score: 0.266,
//   numWords: 4,
//   numHits: 1,
//   average: 0.0665,
//   type: 'senticon',
//   locale: 'es',
//   vote: 'positive'
// }
