import measureCorpus from '../measure-corpus.js';
import { LangEs } from '../../../packages/lang-es/src/index.js';
// import { LangEs } from '@nlpjs-neo/lang-es';
import corpus from '../corpora/corpus-es.json' with { type: 'json' };

(async () => {
  await measureCorpus(corpus, [LangEs]);
})();
