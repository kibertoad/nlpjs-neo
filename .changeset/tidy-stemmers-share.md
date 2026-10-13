---
'@nlpjs-neo/core': minor
'@nlpjs-neo/lang-ar': patch
'@nlpjs-neo/lang-ca': patch
'@nlpjs-neo/lang-cs': patch
'@nlpjs-neo/lang-da': patch
'@nlpjs-neo/lang-de': patch
'@nlpjs-neo/lang-en-min': patch
'@nlpjs-neo/lang-es': patch
'@nlpjs-neo/lang-eu': patch
'@nlpjs-neo/lang-fi': patch
'@nlpjs-neo/lang-fr': patch
'@nlpjs-neo/lang-ga': patch
'@nlpjs-neo/lang-hu': patch
'@nlpjs-neo/lang-hy': patch
'@nlpjs-neo/lang-id': patch
'@nlpjs-neo/lang-it': patch
'@nlpjs-neo/lang-lt': patch
'@nlpjs-neo/lang-ne': patch
'@nlpjs-neo/lang-nl': patch
'@nlpjs-neo/lang-no': patch
'@nlpjs-neo/lang-pl': patch
'@nlpjs-neo/lang-pt': patch
'@nlpjs-neo/lang-ro': patch
'@nlpjs-neo/lang-ru': patch
'@nlpjs-neo/lang-sl': patch
'@nlpjs-neo/lang-sr': patch
'@nlpjs-neo/lang-sv': patch
'@nlpjs-neo/lang-ta': patch
'@nlpjs-neo/lang-tr': patch
---

Tidy the generated Snowball stemmers. What they answer does not change.

The stemmers of 28 languages no longer hide behind a blanket lint disable and
obey the rules it silenced. The try blocks the generator wrote as a flag and a
loop that runs once are labelled blocks, the line references to a Snowball
source this repository does not have are gone from the comments, and numbers
and strings are compared with `===`.

Core adds `SnowballStemmer`, the base of the stemmers that work on regions of
the word. It holds the regions `I_p1`, `I_p2` and `I_pV` and the rules `r_R1`,
`r_R2` and `r_RV` that ask whether the cursor is inside one, which the stemmers
of 18 languages each repeated. They extend it now and no longer carry their
own copies.

`BaseStemmer` gains the scans the generated code spelled out as a loop of twelve lines
each time: `gopast_in_grouping`, `gopast_out_grouping`, `goto_in_grouping` and
`goto_out_grouping`, and their `_b` versions that move backward.

The English stemmer is now generated from `tools/snowball/algorithms/english.sbl` by `tools/snowball`
(`pnpm stemmers`), and `StemmerEn` extends the generated class with the tokenizer. What
it answers does not change.

`BaseStemmer` also has `find_slice` and `find_slice_b` for `[substring]`, and `do_forward`
and `do_backward` to run a rule and put the cursor back.

The Catalan, Basque, Irish, Armenian, Indonesian, Nepali, Tamil and Turkish stemmers are
generated too, from the current Snowball programs. They answer what they did, and
`find_among` runs the guards of a table on the stemmer that searches it, as `find_among_b`
already did.

The Czech stemmer is generated from the Snowball program of Jim O'Regan for the stemmer of
Ljiljana Dolamic, and its answers do not change. The credits of the Czech and Polish stemmers are in
their READMEs.
