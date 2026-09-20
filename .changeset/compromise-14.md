---
'@nlpjs-neo/builtin-compromise': minor
---

Upgrade `compromise` from 13 to `^14.17.0` and `compromise-dates` from 1 to
`^3.9.0`, and drop `compromise-numbers`, whose plugin was folded into
`compromise` core in 14.

Both packages are ESM-native in these versions, so the three
`typeof x.default === 'function'` interop shims are gone and the only plugin
left to register is `dates`.

Two shapes changed inside the library and are mapped back, so the entities this
package produces are unchanged:

- `compromise-dates` 3 reports a match under `dates` rather than `date`.
- `compromise` 14 reports a number as `number.num`, and no longer supplies the
  `cardinal`, `ordinal` and `textOrdinal` spellings the plugin added. A match is
  now recognised as an ordinal from the `Ordinal` tag on its terms, which avoids
  parsing the text a second time, and the `2nd`-style resolution value is
  formatted from the number.
