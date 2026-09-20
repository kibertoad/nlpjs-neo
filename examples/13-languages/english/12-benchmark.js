import measureCorpus from '../measure-corpus.js';
import { LangEn } from '../../../packages/lang-en/src/index.js';
// import { LangEn } from '@nlpjs-neo/lang-en';
import corpus from '../corpora/corpus-en.json' with { type: 'json' };

(async () => {
  await measureCorpus(corpus, [LangEn]);
})();
