---
'@nlpjs-neo/lang-ja': patch
---

`StemmerJa.run` waits for `stem`. It left a promise in `input.tokens`, so the
step after it in a pipeline received a promise instead of the tokens. The
Korean and Chinese stemmers already waited.
