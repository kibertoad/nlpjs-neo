import measureCorpus from '../measure-corpus.js';
import { LangId } from '../../../packages/lang-id/src/index.js';
// import { LangId } from '@nlpjs-neo/lang-id';
import corpus from '../corpora/corpus-id.json' with { type: 'json' };

(async () => {
  await measureCorpus(corpus, [LangId]);
})();
