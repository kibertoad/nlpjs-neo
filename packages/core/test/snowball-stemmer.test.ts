import { SnowballStemmer } from '../src/index.js';

describe('SnowballStemmer', () => {
  describe('regions', () => {
    test('It should tell whether the cursor is inside each region', () => {
      const stemmer = new SnowballStemmer();
      stemmer.I_p1 = 2;
      stemmer.I_p2 = 4;
      stemmer.I_pV = 3;
      stemmer.cursor = 3;
      expect(stemmer.r_R1()).toBe(true);
      expect(stemmer.r_R2()).toBe(false);
      expect(stemmer.r_RV()).toBe(true);
      stemmer.cursor = 1;
      expect(stemmer.r_R1()).toBe(false);
      expect(stemmer.r_RV()).toBe(false);
    });
    test('It should count the start of a region as inside it', () => {
      const stemmer = new SnowballStemmer();
      stemmer.I_p1 = 2;
      stemmer.cursor = 2;
      expect(stemmer.r_R1()).toBe(true);
    });
  });

  describe('copy_from', () => {
    test('It should copy the regions and the cursor state', () => {
      const source = new SnowballStemmer();
      source.setCurrent('word');
      source.I_p1 = 1;
      source.I_p2 = 2;
      source.I_pV = 3;
      source.cursor = 2;
      const copy = new SnowballStemmer();
      copy.copy_from(source);
      expect(copy.I_p1).toBe(1);
      expect(copy.I_p2).toBe(2);
      expect(copy.I_pV).toBe(3);
      expect(copy.getCurrent()).toBe('word');
      expect(copy.cursor).toBe(2);
    });
  });

  describe('a language stemmer', () => {
    test('It should let a language override a rule', () => {
      class Custom extends SnowballStemmer {
        r_R1(): boolean {
          return true;
        }
      }
      const stemmer = new Custom();
      stemmer.I_p1 = 100;
      stemmer.cursor = 0;
      expect(stemmer.r_R1()).toBe(true);
      expect(stemmer.r_R2()).toBe(false);
    });
  });
});
