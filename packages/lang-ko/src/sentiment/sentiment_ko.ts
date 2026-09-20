import afinn from './afinn_ko.json' with { type: 'json' };
import negations from './negations_ko.json' with { type: 'json' };

export default {
  afinn,
  pattern: undefined,
  senticon: undefined,
  negations,
};
