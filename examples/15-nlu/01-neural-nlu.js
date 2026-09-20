import { containerBootstrap } from '../../packages/core/src/index.js';
import { NluNeural } from '../../packages/nlu/src/index.js';
import { LangEn } from '../../packages/lang-en/src/index.js';
// import { containerBootstrap } from '@nlpjs-neo/core';
// import { NluNeural } from '@nlpjs-neo/nlu';
// import { LangEn } from '@nlpjs-neo/lang-en';
import corpus from './corpus50.json' with { type: 'json' };

function prepareCorpus(input, isTests = false) {
  const result = [];
  for (let i = 0; i < input.data.length; i += 1) {
    const { intent } = input.data[i];
    const utterances = isTests ? input.data[i].tests : input.data[i].utterances;
    for (let j = 0; j < utterances.length; j += 1) {
      result.push({ utterance: utterances[j], intent });
    }
  }
  return result;
}

async function measure(useStemmer) {
  const container = await containerBootstrap();
  if (useStemmer) {
    container.use(LangEn);
  }
  const nlu = new NluNeural({ container, locale: 'en', log: false });
  await nlu.train(prepareCorpus(corpus));
  const tests = prepareCorpus(corpus, true);
  let good = 0;
  let total = 0;
  for (let i = 0; i < tests.length; i += 1) {
    const { utterance, intent } = tests[i];
    const result = await nlu.process(utterance);
    total += 1;
    if (result.classifications[0].intent === intent) {
      good += 1;
    }
  }
  console.log(
    `Stemmer: ${useStemmer} Good: ${good} Total: ${total} Precision: ${
      good / total
    }`
  );
}

(async () => {
  await measure(false);
  await measure(true);
})();
