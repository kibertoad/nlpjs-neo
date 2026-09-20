import afinn from './afinn_da.json' with { type: 'json' };
import negations from './negations_da.json' with { type: 'json' };

export default {
  afinn,
  pattern: undefined,
  senticon: undefined,
  negations,
  stemmed: true,
};
