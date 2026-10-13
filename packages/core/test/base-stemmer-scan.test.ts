import { Among, BaseStemmer } from '../src/index.js';

/** A grouping table over the characters min to max, as Snowball builds it. */
function grouping(chars: string, min: number, max: number): number[] {
  const table: number[] = Array.from(
    { length: ((max - min) >> 3) + 1 },
    () => 0
  );
  for (const char of chars) {
    const bit = char.charCodeAt(0) - min;
    table[bit >> 3] |= 1 << (bit & 7);
  }
  return table;
}

const MIN = 97;
const MAX = 122;
const vowels = grouping('aeiou', MIN, MAX);

function stemmerAt(word: string, cursor: number): BaseStemmer {
  const stemmer = new BaseStemmer();
  stemmer.setCurrent(word);
  stemmer.cursor = cursor;
  return stemmer;
}

describe('BaseStemmer scanning', () => {
  describe('gopast', () => {
    test('It should move past the next character of the grouping', () => {
      const stemmer = stemmerAt('strong', 0);
      expect(stemmer.gopast_in_grouping(vowels, MIN, MAX)).toBe(true);
      expect(stemmer.cursor).toBe(4);
    });
    test('It should move past the next character outside the grouping', () => {
      const stemmer = stemmerAt('aaba', 0);
      expect(stemmer.gopast_out_grouping(vowels, MIN, MAX)).toBe(true);
      expect(stemmer.cursor).toBe(3);
    });
    test('It should answer false at the limit when there is none', () => {
      const stemmer = stemmerAt('rhythm', 0);
      expect(stemmer.gopast_in_grouping(vowels, MIN, MAX)).toBe(false);
      expect(stemmer.cursor).toBe(6);
    });
    test('It should scan backwards from the cursor', () => {
      const stemmer = stemmerAt('strong', 6);
      expect(stemmer.gopast_in_grouping_b(vowels, MIN, MAX)).toBe(true);
      expect(stemmer.cursor).toBe(3);
      const other = stemmerAt('aaba', 4);
      expect(other.gopast_out_grouping_b(vowels, MIN, MAX)).toBe(true);
      expect(other.cursor).toBe(2);
    });
    test('It should stop at the backward limit', () => {
      const stemmer = stemmerAt('rhythm', 6);
      stemmer.limit_backward = 2;
      expect(stemmer.gopast_in_grouping_b(vowels, MIN, MAX)).toBe(false);
      expect(stemmer.cursor).toBe(2);
    });
  });

  describe('goto', () => {
    test('It should stop before the next character of the grouping', () => {
      const stemmer = stemmerAt('strong', 0);
      expect(stemmer.goto_in_grouping(vowels, MIN, MAX)).toBe(true);
      expect(stemmer.cursor).toBe(3);
    });
    test('It should stop before the next character outside the grouping', () => {
      const stemmer = stemmerAt('aaba', 0);
      expect(stemmer.goto_out_grouping(vowels, MIN, MAX)).toBe(true);
      expect(stemmer.cursor).toBe(2);
    });
    test('It should answer false at the limit when there is none', () => {
      const stemmer = stemmerAt('rhythm', 0);
      expect(stemmer.goto_in_grouping(vowels, MIN, MAX)).toBe(false);
      expect(stemmer.cursor).toBe(6);
    });
    test('It should scan backwards from the cursor', () => {
      const stemmer = stemmerAt('strong', 6);
      expect(stemmer.goto_in_grouping_b(vowels, MIN, MAX)).toBe(true);
      expect(stemmer.cursor).toBe(4);
      const other = stemmerAt('aaba', 4);
      expect(other.goto_out_grouping_b(vowels, MIN, MAX)).toBe(true);
      expect(other.cursor).toBe(3);
    });
    test('It should stop at the backward limit', () => {
      const stemmer = stemmerAt('rhythm', 6);
      stemmer.limit_backward = 2;
      expect(stemmer.goto_out_grouping_b(vowels, MIN, MAX)).toBe(true);
      expect(stemmer.cursor).toBe(6);
      const none = stemmerAt('rhythm', 6);
      none.limit_backward = 2;
      expect(none.goto_in_grouping_b(vowels, MIN, MAX)).toBe(false);
      expect(none.cursor).toBe(2);
    });
  });
});

describe('BaseStemmer slices and do', () => {
  const forward = [new Among('ab', -1, 1), new Among('abc', 0, 2)];
  const backward = [new Among('c', -1, 1), new Among('bc', 0, 2)];

  test('It should mark the slice of the longest string that matches', () => {
    const stemmer = stemmerAt('abcd', 0);
    expect(stemmer.find_slice(forward)).toBe(2);
    expect([stemmer.bra, stemmer.ket, stemmer.cursor]).toEqual([0, 3, 3]);
  });
  test('It should mark the slice backwards from the cursor', () => {
    const stemmer = stemmerAt('abc', 3);
    expect(stemmer.find_slice_b(backward)).toBe(2);
    expect([stemmer.bra, stemmer.ket, stemmer.cursor]).toEqual([1, 3, 1]);
  });
  test('It should answer 0 and leave the far end of the slice alone', () => {
    const stemmer = stemmerAt('xyz', 0);
    stemmer.ket = 7;
    expect(stemmer.find_slice(forward)).toBe(0);
    expect(stemmer.ket).toBe(7);
  });
  test('It should run a rule and put the cursor back, forward or backward', () => {
    const move = function (this: BaseStemmer) {
      this.cursor = 1;
      return false;
    };
    const forwards = stemmerAt('abcd', 2);
    forwards.do_forward(move);
    expect(forwards.cursor).toBe(2);
    const backwards = stemmerAt('abcd', 3);
    backwards.do_backward(move);
    expect(backwards.cursor).toBe(3);
  });
});
