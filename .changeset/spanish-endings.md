---
'@nlpjs-neo/lang-es': patch
---

Fix the Spanish stemmer missing endings. Its tables had lost their order when the
accents were taken off the rules, so the search skipped some of them (`alabanza`
kept `-anza`, `administrativa` kept `-iva`). The stemmer is now generated from a
Snowball program whose tables are ordered by the compiler, with the changes that
were ours marked in it, and about 1% of the words of the Snowball vocabulary
stem differently, as Snowball stems them.
