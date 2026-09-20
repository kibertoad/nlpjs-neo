import type { Classification } from '../src/index.js';
import type { CorpusEntry } from '../src/index.js';
import {
  ArrToObj,
  Container,
  Normalizer,
  Tokenizer,
  Stemmer,
  Stopwords,
} from '@nlpjs-neo/core';
import { NluNeural } from '../src/index.js';
import srccorpus from './corpus50.json' with { type: 'json' };

const corpus: CorpusEntry[] = [];
for (let i = 0; i < srccorpus.data.length; i += 1) {
  const { intent, utterances } = srccorpus.data[i];
  for (let j = 0; j < utterances.length; j += 1) {
    corpus.push({ utterance: utterances[j], intent });
  }
}

function bootstrap() {
  const container = new Container();
  container.use(ArrToObj);
  container.use(Normalizer);
  container.use(Tokenizer);
  container.use(Stemmer);
  container.use(Stopwords);
  return container;
}

describe('NLU Neural', () => {
  describe('Train and process', () => {
    test('It can train and process a corpus', async () => {
      const nlu = new NluNeural(
        { locale: 'en', useNoneFeature: true },
        bootstrap()
      );
      const status = await nlu.train(corpus);
      expect(status.status.iterations).toEqual(34);
      const json = nlu.neuralNetwork.toJSON();
      nlu.neuralNetwork.fromJSON(json);
      let good = 0;
      for (let i = 0; i < srccorpus.data.length; i += 1) {
        const { intent, tests } = srccorpus.data[i];
        for (let j = 0; j < tests.length; j += 1) {
          const answer = (await nlu.process(tests[j])) as {
            classifications?: Classification[];
          };
          const result = (answer.classifications ||
            answer) as unknown as Classification[];
          const best = (result[0] ||
            'None') as unknown as Partial<Classification>;
          if (best.intent === intent) {
            if (intent === 'None' || best.score >= 0.5) {
              good += 1;
            }
          } else if (intent === 'None' && best.score < 0.5) {
            good += 1;
          }
        }
      }
      expect(good).toBeGreaterThan(194);
    });

    test('It can explain the results', async () => {
      const nlu = new NluNeural(
        { locale: 'en', returnExplanation: true, useNoneFeature: true },
        bootstrap()
      );
      await nlu.train(corpus);
      const result = await nlu.process('what develop your company');
      expect(result.explanation).toBeDefined();
      expect(result.explanation).toEqual([
        {
          stem: '##bias',
          token: '',
          weight: -1.5109167334016105,
        },
        {
          stem: 'what',
          token: 'what',
          weight: 1.7451834678649902,
        },
        {
          stem: 'develop',
          token: 'develop',
          weight: 2.6306886672973633,
        },
        {
          stem: 'your',
          token: 'your',
          weight: 1.4032098054885864,
        },
        {
          stem: 'company',
          token: 'company',
          weight: 5.8944525718688965,
        },
      ]);
    });

    test('An allow list can be added', async () => {
      const nlu = new NluNeural(
        { locale: 'en', useNoneFeature: true },
        bootstrap()
      );
      await nlu.train(corpus);
      const result = await nlu.process('who are you', {
        allowList: ['smalltalk.annoying', 'smalltalk.hungry'],
      });
      expect(result.classifications).toEqual([
        { intent: 'smalltalk.annoying', score: 0.9818832383975855 },
        { intent: 'smalltalk.hungry', score: 0.018116761602414464 },
        { intent: 'smalltalk.acquaintance', score: 0 },
        { intent: 'smalltalk.bad', score: 0 },
      ]);
    });

    test('An allow list with wildcars can be added', async () => {
      const nlu = new NluNeural(
        { locale: 'en', useNoneFeature: true },
        bootstrap()
      );
      await nlu.train(corpus);
      const result = await nlu.process('who are you', {
        allowList: ['smalltalk.an*', 'smalltalk.hun*'],
      });
      expect(result.classifications).toEqual([
        { intent: 'smalltalk.annoying', score: 0.9818832383975855 },
        { intent: 'smalltalk.hungry', score: 0.018116761602414464 },
        { intent: 'smalltalk.acquaintance', score: 0 },
        { intent: 'smalltalk.bad', score: 0 },
      ]);
    });

    test('Allow list can be an object', async () => {
      const nlu = new NluNeural(
        { locale: 'en', useNoneFeature: true },
        bootstrap()
      );
      await nlu.train(corpus);
      const result = await nlu.process('who are you', {
        allowList: { 'smalltalk.annoying': 1, 'smalltalk.hungry': 1 },
      });
      expect(result.classifications).toEqual([
        { intent: 'smalltalk.annoying', score: 0.9818832383975855 },
        { intent: 'smalltalk.hungry', score: 0.018116761602414464 },
        { intent: 'smalltalk.acquaintance', score: 0 },
        { intent: 'smalltalk.bad', score: 0 },
      ]);
    });
  });
});
