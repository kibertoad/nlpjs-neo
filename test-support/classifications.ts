import { expect } from 'vitest';

/** One answer of a classifier: the intent and how sure it is of it. */
export interface Classified {
  intent: string;
  score: number;
}

function isClassified(value: unknown): value is Classified {
  const answer = value as Classified;
  return (
    typeof answer === 'object' &&
    answer !== null &&
    typeof answer.intent === 'string' &&
    typeof answer.score === 'number'
  );
}

/**
 * Asserts the shape of a classifier's answer: it is a list of intent and
 * score pairs, it names known intents, it names each one at most once, it
 * scores them between 0 and 1 and it sorts them from the best score down.
 *
 * How *many* answers come back is not part of it, on purpose. The answer holds
 * one entry per intent that scored above zero, so the count moves with how
 * sure the network is of an utterance, which changes with the defaults and
 * with every retuning. Which intents are dropped, and the `None` that takes
 * their place when they all are, is covered by the `Convert to array` tests of
 * `packages/nlu`; the tests that used to pin a count assert the invariants
 * here and their own top answer instead.
 *
 * It takes an `unknown` because the pipelines type their answer as one, and
 * checking the shape is the point.
 */
export function expectWellFormedClassifications(
  classifications: unknown,
  knownIntents: readonly string[]
): void {
  expect(classifications).toBeInstanceOf(Array);
  const answers = classifications as unknown[];
  expect(answers.filter((answer) => !isClassified(answer))).toEqual([]);

  const intents = (answers as Classified[]).map(({ intent }) => intent);
  expect(intents.filter((intent) => !knownIntents.includes(intent))).toEqual(
    []
  );
  expect([...new Set(intents)]).toEqual(intents);

  const scores = (answers as Classified[]).map(({ score }) => score);
  expect(scores.filter((score) => !(score >= 0 && score <= 1))).toEqual([]);
  expect(scores).toEqual([...scores].sort((a, b) => b - a));
}
