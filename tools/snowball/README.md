# Snowball to TypeScript

The stemmers of most languages come from [Snowball](https://snowballstem.org/), a small
language for writing stemming algorithms. This tool compiles a Snowball program (`.sbl`) into a
TypeScript class that runs on `BaseStemmer` and `SnowballStemmer` of `@nlpjs-neo/core`.

```bash
pnpm stemmers              # generate every stemmer listed in tools/snowball/stemmers.ts
pnpm stemmers lang-en-min  # only the ones whose output path contains this
pnpm stemmers:check        # write nothing, fail when a committed stemmer is not what the tool writes
```

## Why

The stemmers used to be output of the old Snowball JavaScript generator, edited by hand over the
years. Nobody could tell what was Snowball and what was ours, they carried their own lint
exemptions, and updating an algorithm meant rewriting it. Now the algorithm is the Snowball
program, which the tool downloads from Snowball, and the generated file is never edited.

## How a package uses it

```
tools/snowball/stemmers.ts                where the Snowball program is (a version that does not change)
packages/lang-en-min/
  src/stemmer-en.generated.ts             what the tool writes (do not edit)
  src/stemmer-en.ts                       our class: extends the generated one and adds what is ours
```

The programs are not kept in the repository. Each entry of `stemmers.ts` has the address of its
program at a tag or a commit of Snowball, and the SHA-256 it has to have; `pnpm stemmers`
downloads it once into `tools/snowball/.cache/` (ignored by git) and refuses a file whose checksum
is different. A package holds only TypeScript.

What is ours goes in the class that extends the generated one. For English that is the
tokenizer, which expands `I'll` before the words are stemmed:

```ts
class StemmerEn extends SnowballStemmerEn {
  getTokenizer() { /* ... */ }
}
```

A change to the algorithm itself is an edit in `edits.ts`: text of the program to find, which has
to be in it exactly once, and what replaces it, with a comment that says what differs from
Snowball. Then `pnpm stemmers` writes the TypeScript again.

## What is generated so far

Twenty-six languages: English (`lang-en-min`, with our tokenizer on top), Spanish (`lang-es`,
with the changes below), and Arabic, Catalan, Danish, German, Basque, Finnish, French, Irish,
Hungarian, Armenian, Indonesian, Italian, Lithuanian, Nepali, Dutch, Norwegian, Portuguese,
Romanian, Russian, Serbian, Swedish, Tamil, Turkish and Czech, whose generated file is the stemmer
(`stemmer-xx.ts`). All of them are the current programs of Snowball except English, Arabic,
German, Danish, Finnish, French, Hungarian, Italian, Lithuanian, Dutch, Norwegian, Portuguese,
Romanian, Russian, Serbian, Swedish and Spanish, which are Snowball 2.2.0, the version the stemmers
were generated from before: later versions changed the algorithms of several of them (Dutch on 45%
of its words, Romanian on 15%). `stemmers.ts` lists them, and a test (with the programs downloaded, or
`SNOWBALL_ONLINE=1`) checks that each committed file is what the tool writes.

Czech is generated too, from the program that Jim O'Regan sent to Snowball in 2012 for the stemmer
of Ljiljana Dolamic and Jacques Savoy (Snowball's own Czech program, added in 2026, is another
algorithm: it stems 15% of the words differently). Its stringdefs number the characters in
ISO-8859-2, which `stemmers.ts` says with `charset`. It has one change of ours, marked
`nlpjs-neo` (`CZECH`): a word of up to four letters is left alone.

Polish is not Snowball at all: `lang-pl` is a port of `pl_stemmer` by Błażej Kubiński, written by
hand, and its credits are in the package.

## Spanish, which has changes of its own

The Spanish program is Snowball 2.2.0 with three changes (`SPANISH` in `edits.ts`), each marked
`nlpjs-neo` in the program:

- The letters with an accent are the letters without it (the normalizer has taken the accents off
  by the time a word is stemmed), and the lines that only differed by an accent are gone.
- `R2b`, the second half of the word, stands in for `R2` in one rule of `standard_suffix`.
- The verb endings of the future subjunctive and the plural (`ieren`, `aren`, `os`, `s`...) are added
  to `verb_suffix`.

`StemmerEs` adds what cannot be written in Snowball: the dictionary of words that are answered
without the algorithm, taking the pronouns off an infinitive before it, and tidying the end of the
stem after it.

The previous stemmer searched its tables with the accented rules taken out but not put in order
again, so the search missed some endings (`alabanza` kept its `-anza`). Sorting them is what the
compiler does, and 1.1% of the words of the Snowball vocabulary now stem as Snowball stems them.

## Arabic

The Arabic program is Snowball 2.2.0 with one change (`ARABIC`), marked `nlpjs-neo`: `Normalize_pre` also deletes the
punctuation that stays attached to a word (the ASCII marks, and the Arabic comma, semicolon,
question mark, percent and separators), because the tokenizer does not split it off. Without it
`أبله،` is not stemmed at all.

## Adding a language

Add an entry to `STEMMERS` in `stemmers.ts` with the address of the program and its checksum
(`sha256sum` of the file), and run `pnpm stemmers`. The Snowball programs of every language are in
<https://github.com/snowballstem/snowball/tree/master/algorithms>.

## What the generated code looks like

- A routine is a method, and `stem` is `innerStem`. Variables are fields (`I_p1`, `B_Y_found`).
- A command that can fail is a labelled block, and the failure is a `break` out of it.
- The shapes that repeat are calls of the runtime: `[substring]` is `find_slice`, `do <rule>` is
  `do_backward(this.r_Step_2)`, and an `or` of tests that leave the cursor alone, or a `not` of one,
  is a single condition (`!this.eq_s_b('y') && !this.eq_s_b('Y')`).
- `gopast` and `goto` on a grouping are calls (`gopast_in_grouping`, `goto_out_grouping_b`).
- A routine that ends on a test returns it, and one that only tests a region (`R1`, `R2`, `RV`) is
  left out, because `SnowballStemmer` has it.
- Among tables and groupings are static fields. A table is written as text that `Among.table`
  reads (`ing,-1,1 ed,-1,2`, wrapped to the width) unless it has a guard or a string with white
  space, a comma, a backtick, a `$` or a backslash; then it is a list of `new Among(...)`.

## Layout

The generator writes the code laid out as the formatter of the repository wants it (80 columns,
single quotes, the number tables packed), so there is no formatting step: what `pnpm stemmers`
writes passes `oxfmt --check` as it is. A test keeps the committed file equal to what the tool
writes.

## Checking it

`test/snowball.test.ts` reads small programs and runs what they generate. With `SNOWBALL_ONLINE=1`
it also compiles the current English program of Snowball and stems its whole official test
vocabulary; every stem is the official one.

## Where the English program comes from

The English program of `stemmers.ts` is the one of Snowball 2.2.0, which is the one the
old stemmer was generated from, so the stemmer answers what it always did (tested over 100,000
words). The current program of Snowball stems 57 of the 42,000
words of the official vocabulary differently, such as `added`, which it stems to `add`. Replacing
the file with that one is a change of behavior, and is left as a decision.

## Not supported yet

`$` on a string variable (`$s C`), a guarded `among` with a single string, and the
`among` that comes before `substring` (a legacy form). None of the programs of the languages here
uses them; the tool stops with an error where it meets one.

## License

Snowball is BSD licensed (`LICENSE-SNOWBALL`). The programs it downloads keep that license.
