---
'@nlpjs-neo/evaluator': patch
---

Drop the `astring` dependency. A function expression is handed to `Function` as
the source text it was written as, taken from the parsed node, instead of being
generated again from its tree. The function keeps its comments and formatting,
and the package has one dependency less.
