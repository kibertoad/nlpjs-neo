---
'@nlpjs-neo/lang-ja': patch
---

Fix `StemmerJa.formalityLevel` mis-counting two of the four keigo levels.

`keigo.json` spelled them `kenjogo` and `teneigo` while the counter used the
correct `kenjougo` and `teineigo`, so a match on either incremented a counter
that did not exist. The result was `NaN`, which then dropped out of the
`keigo` total and left `isKeigo` false for sentences that are plainly polite:
`元気です` and `拝見する` both reported no keigo at all, and the returned
`counts` carried a stray `NaN` under the misspelled name.

All 16 affected entries in `keigo.json` are corrected, and `formalityLevel`
now only increments a counter it actually has, so a future typo in the data
cannot turn a count into `NaN` again.

`isKeigo` and `counts` change for teineigo and kenjougo input, which is the
point of the fix. Tokenization and stemming are unaffected: `stem` uses
`informalTokens`, which was already correct, and the data change touches only
the level labels, never a replacement value.
