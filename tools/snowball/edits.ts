/**
 * The changes of ours to the Snowball programs.
 *
 * A program is fetched from Snowball as it is published and then edited with
 * these: each `find` has to be in the program exactly once, and is replaced by
 * `replace`. What a change is for is in the comment it adds to the program,
 * marked `nlpjs-neo`.
 */
export interface Edit {
  find: string;
  replace: string;
}

/** Spanish: the text has no accents by the time it is stemmed, and three rules of ours. */
export const SPANISH: Edit[] = [
  {
    find: String.raw`stringdef a'   '{U+00E1}'  // a-acute
stringdef e'   '{U+00E9}'  // e-acute
stringdef i'   '{U+00ED}'  // i-acute
stringdef o'   '{U+00F3}'  // o-acute
stringdef u'   '{U+00FA}'  // u-acute
stringdef u"   '{U+00FC}'  // u-diaeresis
stringdef n~   '{U+00F1}'  // n-tilde`,
    replace: String.raw`// nlpjs-neo: by the time a word is stemmed the normalizer has taken the accents
// off, so the letters with an accent are the letters without it. The rules that
// only differed by an accent, and are now the same string, are written once.
stringdef a'   'a'  // a-acute
stringdef e'   'e'  // e-acute
stringdef i'   'i'  // i-acute
stringdef o'   'o'  // o-acute
stringdef u'   'u'  // u-acute
stringdef u"   'u'  // u-diaeresis
stringdef n~   'n'  // n-tilde`,
  },
  {
    find: 'RV R1 R2\n',
    replace: 'RV R1 R2 R2b\n',
  },
  {
    find: '    define R2 as $p2 <= cursor\n',
    replace: `    define R2 as $p2 <= cursor
    // nlpjs-neo: the second half of the word, for the endings that are not a plain R2 (see standard_suffix)
    define R2b as $(cursor * 2 >= size)
`,
  },
  {
    find: String.raw`            'i{e'}ndo' (] <- 'iendo')
            '{a'}ndo'  (] <- 'ando')
            '{a'}r'    (] <- 'ar')
            '{e'}r'    (] <- 'er')
            '{i'}r'    (] <- 'ir')
`,
    replace: String.raw`            // nlpjs-neo: the lines that took the accent off i{e'}ndo, {a'}ndo, {a'}r, {e'}r and {i'}r are gone
`,
  },
  {
    find: `'ante' 'antes' 'ancia' 'ancias'// Note 1
            (
                R2 delete`,
    replace: `'ante' 'antes' 'ancia' 'ancias'// Note 1
            (
                R2b delete // nlpjs-neo: R2b where Snowball has R2`,
  },
  {
    find: String.raw`'{a'}ramos' 'i{e'}ramos' 'i{e'}semos' '{a'}semos'
                (delete)`,
    replace: String.raw`'{a'}ramos' 'i{e'}ramos' 'i{e'}semos' '{a'}semos'
            // nlpjs-neo: more endings of the future subjunctive, and the plural
            'ieremos' 'iereis' 'ieren' 'ieres' 'iere' 'aren' 'ares' 'eren'
            'esen' 'ea' 'ee' 'eo' 's' 'os' 'ios'
                (delete)`,
  },
];

/** Arabic: the punctuation that the tokenizer leaves on a word. */
export const ARABIC: Edit[] = [
  {
    find: "                '{_}' ( delete ) // strip kasheeda\n",
    replace: String.raw`                '{_}' ( delete ) // strip kasheeda

                // nlpjs-neo: strip the punctuation that stays attached to a word, because
                // the tokenizer does not split it off: the ASCII marks, the Arabic comma,
                // semicolon and question mark, and the Arabic percent and separators.
                '!' '{'}' '%' '*' ',' '.' '/' ':' ';' '?' '\'
                '{U+060C}' '{U+061B}' '{U+061F}' '{U+066A}' '{U+066B}' '{U+066C}' ( delete )
`,
  },
];

/** Czech: a word of up to four letters is left alone. */
export const CZECH: Edit[] = [
  {
    find: 'define stem as (\n  do mark_regions',
    replace:
      'define stem as (\n  $(size > 4) // nlpjs-neo: a word of up to four letters is left alone\n  do mark_regions',
  },
];
