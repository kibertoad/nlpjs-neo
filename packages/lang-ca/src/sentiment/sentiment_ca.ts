import senticon from './senticon_ca.json' with { type: 'json' };
import negations from './negations_ca.json' with { type: 'json' };

export default {
  afinn: undefined,
  pattern: undefined,
  senticon,
  negations,
  stemmed: true,
};
