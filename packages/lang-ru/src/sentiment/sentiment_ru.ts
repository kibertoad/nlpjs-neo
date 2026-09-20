import afinn from './afinn_ru.json' with { type: 'json' };
import negations from './negations_ru.json' with { type: 'json' };

export default {
  afinn,
  pattern: undefined,
  senticon: undefined,
  negations,
  stemmed: true,
};
