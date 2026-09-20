---
'@nlpjs-neo/core-loader': patch
---

Fix the plugin name table so every language can be named from a `conf.json`: `LangAr`
pointed at a `LangAll` class that `@nlpjs-neo/lang-ar` does not export, and `LangKo`,
`LangLt`, `LangMs`, `LangNe`, `LangPl` and `LangSr` had no entry at all.
