import type { BenchRunOptions } from 'vitest';

/**
 * Run budgets shared by every benchmark in the repository, so that results
 * stay comparable between runs and the whole suite finishes in about a
 * minute. Pass one to `registration.run()` or as the trailing argument of
 * `bench.compare()`.
 *
 * `time` is the minimum wall time a task is sampled for and `iterations` the
 * minimum number of samples; tinybench keeps sampling until both are
 * satisfied, so the slower the work, the lower the sample count has to be for
 * the budget to hold.
 */

/** Sub-microsecond work: string helpers, tokenizers, distance functions. */
export const microBudget: BenchRunOptions = {
  time: 250,
  iterations: 100,
  warmupTime: 100,
  warmupIterations: 50,
  throws: true,
};

/** Work in the microsecond-to-millisecond range: a single utterance through a pipeline. */
export const pipelineBudget: BenchRunOptions = {
  time: 500,
  iterations: 25,
  warmupTime: 150,
  warmupIterations: 5,
  throws: true,
};

/** Work measured in seconds: training a model over a corpus. */
export const trainingBudget: BenchRunOptions = {
  time: 500,
  iterations: 5,
  warmupTime: 0,
  warmupIterations: 1,
  throws: true,
};
