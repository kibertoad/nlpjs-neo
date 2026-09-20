import measureCorpus from '../measure-corpus.js';
import corpus from '../corpora/corpus-he.json' with { type: 'json' };

(async () => {
  await measureCorpus(corpus, []);
})();
