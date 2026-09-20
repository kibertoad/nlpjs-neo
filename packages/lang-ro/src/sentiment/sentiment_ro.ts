import afinn from './afinn_ro.json' with { type: 'json' };
import negations from './negations_ro.json' with { type: 'json' };

export default {
  afinn,
  pattern: undefined,
  senticon: undefined,
  negations,
};
