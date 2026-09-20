import afinn from './afinn_fi.json' with { type: 'json' };
import negations from './negations_fi.json' with { type: 'json' };

export default {
  afinn,
  pattern: undefined,
  senticon: undefined,
  negations,
  stemmed: true,
};
