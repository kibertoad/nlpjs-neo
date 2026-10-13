import BaseStemmer from './base-stemmer.js';

/**
 * Base of the stemmers generated from Snowball programs that work on regions
 * of the word.
 *
 * Snowball marks the regions of a word once, with `setmark`, and the rules
 * then ask whether the cursor is inside one of them. R1 and R2 are the
 * regions of the standard algorithm and RV the region after the first vowels,
 * so `I_p1`, `I_p2` and `I_pV` are where each of them starts. A stemmer that
 * uses only some of them leaves the others alone, and one whose regions are
 * defined differently overrides the rule.
 */
class SnowballStemmer extends BaseStemmer {
  /** Where the region R1 starts. */
  declare I_p1: number;
  /** Where the region R2 starts. */
  declare I_p2: number;
  /** Where the region RV starts. */
  declare I_pV: number;

  copy_from(other: SnowballStemmer): void {
    this.I_p2 = other.I_p2;
    this.I_p1 = other.I_p1;
    this.I_pV = other.I_pV;
    super.copy_from(other);
  }

  /** Whether the cursor is inside the region R1. */
  r_R1(): boolean {
    return this.I_p1 <= this.cursor;
  }

  /** Whether the cursor is inside the region R2. */
  r_R2(): boolean {
    return this.I_p2 <= this.cursor;
  }

  /** Whether the cursor is inside the region RV. */
  r_RV(): boolean {
    return this.I_pV <= this.cursor;
  }
}

export default SnowballStemmer;
