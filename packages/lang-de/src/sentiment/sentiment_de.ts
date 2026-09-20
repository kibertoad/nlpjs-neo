import senticon from './senticon_de.json' with { type: 'json' };
import negations from './negations_de.json' with { type: 'json' };

export default {
  afinn: undefined,
  pattern: undefined,
  senticon,
  negations,
  stemmed: true,
};
