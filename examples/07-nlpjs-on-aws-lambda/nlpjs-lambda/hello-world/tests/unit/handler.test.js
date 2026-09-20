import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { lambdaHandler } from '../../app.js';

describe('Tests index', () => {
  it('verifies successful response', async () => {
    const result = await lambdaHandler();

    assert.equal(result.statusCode, 200);
    assert.equal(typeof result.body, 'string');
    assert.deepEqual(JSON.parse(result.body), { message: 'hello world' });
  });
});
