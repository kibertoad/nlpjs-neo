import measureCorpus from '../measure-corpus.js';
import { LangIt } from '../../../packages/lang-it/src/index.js';
// import { LangIt } from '@nlpjs-neo/lang-it';
import corpus from '../corpora/corpus-it.json' with { type: 'json' };

(async () => {
  await measureCorpus(corpus, [LangIt]);
})();
