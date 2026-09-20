import { expect, test } from 'vitest';
import corpus from '#bench/fixtures/corpus-en.json' with { type: 'json' };
import { pipelineBudget, trainingBudget } from '#bench/options.js';
import { NeuralNetwork } from '../src/index.js';

type Sample = { input: Record<string, number>; output: Record<string, number> };

/**
 * The network sees opaque feature names, so the corpus only has to be split
 * into words the way the NLU pipeline would hand them over.
 */
function toSamples(): Sample[] {
  const samples: Sample[] = [];
  for (const intent of corpus.data) {
    for (const utterance of intent.utterances) {
      const input: Record<string, number> = {};
      for (const token of utterance.toLowerCase().split(/[\s,.!?;:'"¿()]+/)) {
        if (token) {
          input[token] = 1;
        }
      }
      samples.push({ input, output: { [intent.intent]: 1 } });
    }
  }
  return samples;
}

const samples = toSamples();

const trained = new NeuralNetwork();
trained.train(samples);

const knownInput = samples[0].input;
const unknownInput = { something: 1, completely: 1, different: 1 };

// Training walks every perceptron over every sample once per iteration, and
// keeps iterating until the error settles. It is the slowest thing the
// library does, and the reason `train()` is called offline.
test('NeuralNetwork#train', async ({ bench }) => {
  await bench('corpus of 51 intents', () => {
    const network = new NeuralNetwork();
    network.train(samples);
  }).run(trainingBudget);
});

// Classification is the opposite: one pass over the perceptrons, and the hot
// path of every `process()` call at runtime.
test('NeuralNetwork#run', async ({ bench }) => {
  // The network has to actually classify for the numbers to mean anything, so
  // its output is checked once before it is measured.
  expect(trained.run(knownInput)[corpus.data[0].intent]).toBeGreaterThan(0.5);

  await bench.compare(
    bench('known features', () => {
      trained.run(knownInput);
    }),
    bench('unknown features', () => {
      trained.run(unknownInput);
    }),
    pipelineBudget
  );
});
