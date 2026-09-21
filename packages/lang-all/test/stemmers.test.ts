import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The Snowball stemmers are generated code, hundreds of rules long, and the
 * one test each language has looks at a handful of words. This test pins what
 * every one of them answers for a few thousand words, so that a change to how
 * they are written can be told apart from a change to what they do.
 *
 * The words are the vocabulary the language packs already ship, the endings
 * those words have, and words made of the two, plus a seeded run of random
 * ones. The answers are kept as a hash for each slice of the words, one line
 * for each language, in `stemmers.golden.json`. When a stemmer changes on purpose, regenerate the
 * file with `UPDATE_STEMMER_GOLDEN=1` and review what moved.
 */

interface StemmerClass {
  new (): { stemWord(word: string): string };
}

/** Languages whose stemmer is Snowball output, and where the source is. */
const LANGUAGES: Record<string, { pack: string; file: string }> = {};
for (const code of [
  'ar',
  'ca',
  'cs',
  'da',
  'de',
  'en',
  'es',
  'eu',
  'fi',
  'fr',
  'ga',
  'hu',
  'hy',
  'id',
  'it',
  'lt',
  'ne',
  'nl',
  'no',
  'pl',
  'pt',
  'ro',
  'ru',
  'sl',
  'sr',
  'sv',
  'ta',
  'tr',
]) {
  LANGUAGES[code] = {
    pack: code === 'en' ? 'lang-en-min' : `lang-${code}`,
    file: `stemmer-${code}`,
  };
}

/** Absolute path of a file of a language pack. */
const packFile = (pack: string, path: string) =>
  fileURLToPath(new URL(`../../${pack}/src/${path}`, import.meta.url));

const GOLDEN_FILE = fileURLToPath(
  new URL('./stemmers.golden.json', import.meta.url)
);
const SLICE = 500;

/** Repeatable pseudo-random numbers, so the words are the same on every run. */
function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** `count` items spread evenly over the array, in order. */
function spread<T>(items: T[], count: number): T[] {
  if (items.length <= count) {
    return items;
  }
  const step = items.length / count;
  return Array.from({ length: count }, (_, i) => items[Math.floor(i * step)]);
}

async function vocabulary(pack: string, code: string): Promise<string[]> {
  const words = new Set<string>();
  const stopwordsFile = packFile(pack, `stopwords-${code}.ts`);
  if (existsSync(stopwordsFile)) {
    const { default: Stopwords } = await import(
      /* @vite-ignore */ stopwordsFile
    );
    Object.keys(new Stopwords().dictionary).forEach((w) => words.add(w));
  }
  const sentiment = packFile(pack, 'sentiment');
  if (existsSync(sentiment)) {
    for (const name of readdirSync(sentiment)) {
      if (/^(afinn|pattern|senticon)_.*\.json$/.test(name)) {
        const lexicon = JSON.parse(
          readFileSync(`${sentiment}/${name}`, 'utf8')
        );
        Object.keys(lexicon).forEach((w) => words.add(w));
      }
    }
  }
  return [...words]
    .filter(
      (w) => w.length > 0 && w.length < 40 && /^[\p{L}\p{M}'-]+$/u.test(w)
    )
    .sort();
}

/** The words a language is stemmed with in this test. */
function corpus(vocab: string[]): string[] {
  const next = random(12345);
  const pickFrom = <T>(items: T[]): T =>
    items[Math.floor(next() * items.length)];
  const endings = [
    ...new Set(vocab.flatMap((w) => [1, 2, 3, 4].map((n) => w.slice(-n)))),
  ].sort();
  const roots = spread(vocab, 300);
  const words = new Set<string>(spread(vocab, 3000));
  for (const root of roots) {
    for (const ending of spread(endings, 40)) {
      words.add(root + ending);
    }
  }
  const alphabet = [...new Set(vocab.join(''))];
  const randomWord = (min: number, max: number) => {
    const length = min + Math.floor(next() * (max - min + 1));
    return Array.from({ length }, () => pickFrom(alphabet)).join('');
  };
  if (alphabet.length > 0 && endings.length > 0) {
    for (let i = 0; i < 2500; i += 1) {
      const root = next() < 0.5 ? randomWord(2, 9) : pickFrom(vocab);
      const first = pickFrom(endings);
      const second = pickFrom(endings);
      words.add(randomWord(1, 12));
      words.add(root + first);
      words.add(root + first + second);
      words.add(root.slice(0, -1 - Math.floor(next() * 2)) + first);
    }
  }
  return [...words];
}

function hashOf(stems: string[]): string {
  return createHash('sha256')
    .update(stems.join('\n'))
    .digest('hex')
    .slice(0, 16);
}

const update = process.env.UPDATE_STEMMER_GOLDEN === '1';
const golden: Record<string, string> =
  !update && existsSync(GOLDEN_FILE)
    ? JSON.parse(readFileSync(GOLDEN_FILE, 'utf8'))
    : {};
const written: Record<string, string> = {};

afterAll(() => {
  if (update) {
    writeFileSync(GOLDEN_FILE, `${JSON.stringify(written, null, 1)}\n`);
  }
});

describe('Snowball stemmers', () => {
  test.each(Object.keys(LANGUAGES))(
    'It should stem %s as it always did',
    async (code) => {
      const { pack, file } = LANGUAGES[code];
      const { default: Stemmer }: { default: StemmerClass } = await import(
        /* @vite-ignore */ packFile(pack, `${file}.ts`)
      );
      const stemmer = new Stemmer();
      const words = corpus(await vocabulary(pack, code));
      expect(words.length).toBeGreaterThan(1000);
      const stems = words.map((word) => stemmer.stemWord(word));
      const hashes: string[] = [];
      for (let i = 0; i < stems.length; i += SLICE) {
        hashes.push(hashOf(stems.slice(i, i + SLICE)));
      }
      written[code] = hashes.join(' ');
      // When the file is being rewritten there is nothing to compare with.
      const expected = (update ? written[code] : golden[code])?.split(' ');
      expect(expected, `no hashes are kept for ${code}`).toBeDefined();
      if (!expected) {
        return;
      }
      const moved = hashes
        .map((hash, i) => (hash === expected[i] ? -1 : i))
        .filter((i) => i >= 0)
        .map((i) => `words ${i * SLICE}-${i * SLICE + SLICE - 1}`);
      expect(moved).toEqual([]);
      expect(hashes.length).toEqual(expected.length);
    },
    60000
  );
});
