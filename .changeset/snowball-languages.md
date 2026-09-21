---
'@nlpjs-neo/lang-fi': patch
'@nlpjs-neo/lang-fr': patch
'@nlpjs-neo/lang-hu': patch
'@nlpjs-neo/lang-pt': patch
'@nlpjs-neo/lang-ru': patch
---

Fix the letters that the Finnish, French, Hungarian, Portuguese and Russian
stemmers did not handle as Snowball does. Hungarian did not stem the endings of
words with `ő` and `ű` (it matched `õ` and `û`), so `adatvédelemről` kept `-ről`.
Russian kept `ё` (`актёр` is now `актер`), French did not treat `ï` and `ë` as
Snowball does (`aiguë` is now `aigu`), Portuguese kept `-çã` in `revolução`, and
Finnish stripped the vowel after an accented foreign letter (`españa`). The
stemmers are now generated from the Snowball programs; the answers of the other
languages that changed source do not change.
