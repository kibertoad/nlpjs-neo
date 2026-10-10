import base from '../../vitest.config.mjs';

/** Config for `massive.test.ts`, which the regular runs leave out. */
export default {
  ...base,
  test: {
    ...base.test,
    include: ['bench/massive/*.test.ts'],
    testTimeout: 30 * 60 * 1000,
  },
};
