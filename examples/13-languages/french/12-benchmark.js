import measureCorpus from '../measure-corpus.js';
// import { LangFr } from '@nlpjs-neo/lang-fr';
import { LangFr } from '../../../packages/lang-fr/src/index.js';
import corpus from '../corpora/corpus-fr.json' with { type: 'json' };

(async () => {
  await measureCorpus(corpus, [LangFr]);
})();
