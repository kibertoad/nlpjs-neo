import { Container } from '../../../packages/core/src/index.js';
import { SentimentAnalyzer } from '../../../packages/sentiment/src/index.js';
import { LangFr } from '../../../packages/lang-fr/src/index.js';

(async () => {
  const container = new Container();
  container.use(LangFr);
  const sentiment = new SentimentAnalyzer({ container });
  const result = await sentiment.process({
    locale: 'fr',
    text: "C'est un bon film",
  });
  console.log(result.sentiment);
})();
// output:
// {
//   score: 0.7,
//   numWords: 5,
//   numHits: 1,
//   average: 0.13999999999999999,
//   type: 'pattern',
//   locale: 'fr',
//   vote: 'positive'
// }
