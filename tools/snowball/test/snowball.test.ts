import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { generate } from '../generate.ts';
import { parseSource } from '../sbl.ts';
import { render, STEMMERS } from '../stemmers.ts';
import { applyEdits, fetchProgram, isCached } from '../sources.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const generated = `${here}.generated`;

interface Stemmer {
  stemWord(word: string): string;
}

/** Compiles a program, loads the class it makes and returns an instance. */
async function compile(
  source: string,
  id: string,
  inheritRegions = false
): Promise<Stemmer> {
  mkdirSync(generated, { recursive: true });
  const code = generate(parseSource(source), {
    className: 'TestStemmer',
    name: 'test-stemmer',
    source: `${id}.sbl`,
    inheritRegions,
  });
  const file = `${generated}/${id}.ts`;
  writeFileSync(file, code);
  const module = await import(/* @vite-ignore */ file);
  return new module.default();
}

describe('Snowball compiler', () => {
  describe('the programs of Snowball', () => {
    const root = fileURLToPath(new URL('../../../', import.meta.url));
    const online = process.env.SNOWBALL_ONLINE === '1';

    // These download, so they run when SNOWBALL_ONLINE=1 (the freshness ones
    // also run when the programs were downloaded before, by `pnpm stemmers`).
    test('It should stem the vocabulary of English as the current Snowball does', async () => {
      if (!online) {
        return;
      }
      const raw = 'https://raw.githubusercontent.com/snowballstem/';
      const get = async (url: string) =>
        (await (await fetch(raw + url)).text())
          .split(String.fromCharCode(10))
          .filter(Boolean);
      const stemmer: Stemmer = await compile(
        (await get('snowball/master/algorithms/english.sbl')).join(
          String.fromCharCode(10)
        ),
        'english',
        true
      );
      const words = await get('snowball-data/master/english/voc.txt');
      const expected = await get('snowball-data/master/english/output.txt');
      expect(words.length).toBeGreaterThan(5000);
      const wrong = words
        .map((word, at) => [word, expected[at], stemmer.stemWord(word)])
        .filter(([, official, ours]) => official !== ours)
        .map(([word, official, ours]) => `${word}: ${official} / ${ours}`);
      expect(wrong).toEqual([]);
    }, 60000);

    test.each(STEMMERS.map((stemmer) => [stemmer.out, stemmer] as const))(
      'It should have %s as the tool writes it from its program',
      async (_out, stemmer) => {
        if (!online && !isCached(stemmer.source)) {
          return;
        }
        const committed = readFileSync(`${root}${stemmer.out}`, 'utf8');
        expect(committed.split(String.fromCharCode(13)).join('')).toEqual(
          await render(stemmer)
        );
      },
      30000
    );
  });

  describe('changing a program', () => {
    test('It should apply an edit that matches once', () => {
      expect(applyEdits('a b c', [{ find: 'b', replace: 'B' }], 'test')).toBe(
        'a B c'
      );
    });

    test('It should refuse an edit that matches nowhere or twice', () => {
      expect(() =>
        applyEdits('a b c', [{ find: 'z', replace: 'Z' }], 'test')
      ).toThrow(/does not match/);
      expect(() =>
        applyEdits('a b b', [{ find: 'b', replace: 'B' }], 'test')
      ).toThrow(/twice/);
    });

    test('It should refuse a program that is not the one that was expected', async () => {
      const original = globalThis.fetch;
      globalThis.fetch = (async () =>
        new Response('define stem as true')) as typeof fetch;
      try {
        await expect(
          fetchProgram(
            { url: 'https://example.invalid/x.sbl', sha256: '0'.repeat(64) },
            `${generated}/cache-${Date.now()}/`
          )
        ).rejects.toThrow(/checksum/);
      } finally {
        globalThis.fetch = original;
      }
    });
  });

  describe('reading a program', () => {
    test('It should read the names, the groupings and the routines', () => {
      const program = parseSource(`
        integers ( p1 )
        booleans ( Y_found )
        routines ( Step_1a exception1 )
        externals ( stem )
        groupings ( aeo v )
        define aeo 'aeo'
        define v aeo + 'y'
        define Step_1a as ( true )
        define exception1 as ( true )
        define stem as Step_1a
      `);
      expect(program.names.get('p1')).toBe('integer');
      expect(program.names.get('Y_found')).toBe('boolean');
      expect(program.names.get('Step_1a')).toBe('routine');
      expect(program.names.get('stem')).toBe('external');
      expect(program.groupings.map((g) => g.name)).toEqual(['aeo', 'v']);
      expect(program.routines.map((r) => r.name)).toContain('exception1');
    });

    test('It should add and take away characters of a grouping', () => {
      const program = parseSource(`
        groupings ( a b )
        define a 'abcd'
        define b a - 'bc' + 'z'
      `);
      const chars = (name: string) =>
        String.fromCharCode(
          ...program.groupings.find((g) => g.name === name)!.chars
        );
      expect(chars('a')).toBe('abcd');
      expect(chars('b')).toBe('adz');
    });

    test('It should expand the string escapes and the stringdefs', () => {
      const program = parseSource(`
        routines ( r )
        externals ( stem )
        stringescapes {}
        stringdef e'  '{U+00E9}'
        define r as ('caf{e'}' '{'}')
        define stem as r
      `);
      const body = program.routines[0].body;
      expect(body.t).toBe('seq');
      const items = (body as { items: { t: string; s?: string }[] }).items;
      expect(items.map((item) => item.s)).toEqual(['café', "'"]);
    });

    test('It should read the numbers of a stringdef in the character set it is given', () => {
      const source = `
        routines ( r )
        externals ( stem )
        stringescapes {}
        stringdef z^ hex 'BE'
        define r as ('{z^}')
        define stem as r
      `;
      const chars = (charset?: string) =>
        (
          parseSource(source, 'input.sbl', { charset }).routines[0].body as {
            s: string;
          }
        ).s;
      // 0xBE is the letter ž in ISO-8859-2, and the fraction ¾ in Latin-1.
      expect(chars('iso-8859-2')).toBe('ž');
      expect(chars()).toBe('¾');
    });

    test('It should refuse a name that was not declared', () => {
      expect(() =>
        parseSource('externals ( stem )\ndefine stem as missing')
      ).toThrow(/undeclared/);
    });

    test('It should refuse a string that never ends', () => {
      expect(() => parseSource("routines ( r )\ndefine r as 'abc")).toThrow(
        /not terminated/
      );
    });
  });

  describe('a program that is written for the test', () => {
    test('It should replace a suffix that is at the end of the word', async () => {
      const stemmer = await compile(
        `
        externals ( stem )
        define stem as ( backwards ( ['ing'] <- 'e' ) )
        `,
        'suffix'
      );
      expect(stemmer.stemWord('making')).toBe('make');
      expect(stemmer.stemWord('kingdom')).toBe('kingdom');
    });

    test('It should try, and put the cursor back when the attempt fails', async () => {
      const stemmer = await compile(
        `
        externals ( stem )
        define stem as ( try ( 'ab' 'x' ) ['ab'] <- 'AB' )
        `,
        'try'
      );
      expect(stemmer.stemWord('abc')).toBe('ABc');
      expect(stemmer.stemWord('abx')).toBe('abx');
    });

    test('It should walk past a grouping and count with a variable', async () => {
      const stemmer = await compile(
        `
        integers ( vowels )
        groupings ( v )
        externals ( stem )
        define v 'aeiou'
        define stem as (
          $vowels = 0
          repeat ( gopast v $vowels += 1 )
          $vowels == 3
          [] <- 'three'
        )
        `,
        'count'
      );
      expect(stemmer.stemWord('banana')).toBe('bananathree');
      expect(stemmer.stemWord('tree')).toBe('tree');
    });

    test('It should read the among that follows a substring', async () => {
      const stemmer = await compile(
        `
        externals ( stem )
        define stem as (
          backwards (
            [substring] among (
              'ies' (<- 'y')
              'es' 's' (delete)
            )
          )
        )
        `,
        'among'
      );
      expect(stemmer.stemWord('flies')).toBe('fly');
      expect(stemmer.stemWord('boxes')).toBe('box');
      expect(stemmer.stemWord('cats')).toBe('cat');
      expect(stemmer.stemWord('dog')).toBe('dog');
    });

    test('It should run the code before the first string of an among', async () => {
      // The older way to write `[substring] among ( ... )`.
      const stemmer = await compile(
        `
        externals ( stem )
        define stem as (
          backwards (
            [ among ( ( ] ) 'ing' (<- 'e') 'ed' (delete) )
          )
        )
        `,
        'starter'
      );
      expect(stemmer.stemWord('making')).toBe('make');
      expect(stemmer.stemWord('jumped')).toBe('jump');
    });

    test('It should hop and stop at the limit', async () => {
      const stemmer = await compile(
        `
        externals ( stem )
        define stem as ( hop 2 [] <- '-' )
        `,
        'hop'
      );
      expect(stemmer.stemWord('abcd')).toBe('ab-cd');
      expect(stemmer.stemWord('a')).toBe('a');
    });
  });
});
