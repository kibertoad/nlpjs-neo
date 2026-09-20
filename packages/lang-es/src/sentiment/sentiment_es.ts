import afinn from './afinn_es.json' with { type: 'json' };
import senticon from './senticon_es.json' with { type: 'json' };
import negations from './negations_es.json' with { type: 'json' };

export default {
  afinn,
  pattern: undefined,
  senticon,
  negations,
  stemmed: true,
};
