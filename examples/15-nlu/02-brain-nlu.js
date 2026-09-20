import { BrainNLU } from '../../packages/node-nlp/src/index.js';
// import { BrainNLU } from 'node-nlp-neo';
import corpus from './corpus50.json' with { type: 'json' };

(async () => {
  const nlu = new BrainNLU({ language: 'en' });
  for (let i = 0; i < corpus.data.length; i += 1) {
    const { utterances, intent } = corpus.data[i];
    for (let j = 0; j < utterances.length; j += 1) {
      nlu.add(utterances[j], intent);
    }
  }
  await nlu.train();
  let total = 0;
  let good = 0;
  for (let i = 0; i < corpus.data.length; i += 1) {
    const { tests, intent } = corpus.data[i];
    for (let j = 0; j < tests.length; j += 1) {
      const classification = await nlu.getBestClassification(tests[j]);
      total += 1;
      if (classification.intent === intent) {
        good += 1;
      }
    }
  }
  console.log(`Good: ${good} Total: ${total} Precision: ${good / total}`);
})();
