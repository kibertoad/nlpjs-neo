import afinn from './afinn_ne.json' with { type: 'json' };
import negations from './negations_ne.json' with { type: 'json' };

export default {
  afinn,
  pattern: undefined,
  senticon: undefined,
  negations,
};
