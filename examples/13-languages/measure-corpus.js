import { containerBootstrap } from '../../packages/core/src/index.js';
import { Nlp } from '../../packages/nlp/src/index.js';
// import { containerBootstrap } from '@nlpjs-neo/core';
// import { Nlp } from '@nlpjs-neo/nlp';

async function measureCorpus(corpus, plugins) {
  const container = await containerBootstrap();
  container.use(Nlp);
  if (plugins) {
    plugins.forEach((plugin) => {
      container.use(plugin);
    });
  }
  const nlp = container.get('nlp');
  nlp.settings.threshold = 0;
  nlp.settings.autoSave = false;
  await nlp.addCorpus(corpus);
  await nlp.train();
  let total = 0;
  let goodThreshold = 0;
  let goodNoThreshold = 0;
  for (let i = 0; i < corpus.data.length; i += 1) {
    const item = corpus.data[i];
    for (let j = 0; j < item.tests.length; j += 1) {
      const test = item.tests[j];
      total += 1;
      nlp.settings.threshold = 0;
      let result = await nlp.process(test);
      if (result.intent === item.intent) {
        goodNoThreshold += 1;
      } else {
        console.log(`${result.intent} ${item.intent} ${test}`);
      }
      nlp.settings.threshold = 0.5;
      result = await nlp.process(test);
      if (result.intent === item.intent) {
        goodThreshold += 1;
      }
    }
  }
  console.log(`Total tests executed: ${total}`);
  console.log(`Total intents guessed correctly: ${goodNoThreshold}`);
  console.log(
    `Total intents guessed correctly with score >= 0.5: ${goodThreshold}`
  );
  console.log(
    `Precision without threshold: ${(goodNoThreshold * 100) / total}%`
  );
  console.log(`Precision with threshold: ${(goodThreshold * 100) / total}%`);
}

export default measureCorpus;
