import afinn from './afinn_pt.json' with { type: 'json' };
import negations from './negations_pt.json' with { type: 'json' };

export default {
  afinn,
  pattern: undefined,
  senticon: undefined,
  negations,
  stemmed: true,
};
