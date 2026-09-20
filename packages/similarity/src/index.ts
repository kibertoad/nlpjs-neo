import leven from './leven.js';
import similarity from './similarity.js';
import CosineSimilarity from './cosine-similarity.js';
import SpellCheck from './spell-check.js';

export { leven, CosineSimilarity, similarity, SpellCheck };

export type { Features, SpellCheckSettings } from './spell-check.js';
