import senticon from './senticon_eu.json' with { type: 'json' };
import negations from './negations_eu.json' with { type: 'json' };

export default {
  afinn: undefined,
  pattern: undefined,
  senticon,
  negations,
  stemmed: true,
};
