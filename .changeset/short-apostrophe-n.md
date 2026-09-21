---
'@nlpjs-neo/lang-ja': patch
---

`StemmerJa.toRomaji` separates a syllabic `ん` from the vowel or y-kana that
follows it with an apostrophe, as Hepburn does: `ホンヤ` is `hon'ya` and not
`honya`, which reads as ho-nya. The code meant to do so, but rebuilt the
string unchanged.
