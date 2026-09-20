import afinn from './afinn_bn.json' with { type: 'json' };
import negations from './negations_bn.json' with { type: 'json' };

export default {
  afinn,
  pattern: undefined,
  senticon: undefined,
  negations,
  stemmed: true,
};
