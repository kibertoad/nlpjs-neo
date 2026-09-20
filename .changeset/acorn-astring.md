---
'@nlpjs-neo/evaluator': minor
---

Replace `esprima` with `acorn` `^8.18.0` and `escodegen` with `astring` `^1.9.0`.

`esprima` 4.0.1 dates from 2018 and understands nothing newer than ES2017, so
any expression using syntax added since then was a parse error. Both libraries
produce and consume ESTree and the walkers only ever called `parse(str)` and
`generate(node)`, so the swap itself is mechanical; the acorn options live in one
new `parse` module shared by `Evaluator` and `JavascriptCompiler`.

The walkers gained the two features that make the new parser worth having:

- `??`, including the short circuit that leaves the right term unevaluated when
  the left one is neither `null` nor `undefined`.
- Optional chaining: `a?.b`, `a?.[b]` and `a?.()` short-circuit to `undefined`.
  Only a link that carries `?.` short-circuits, so `a?.b.c` still throws on the
  plain `.c` when `a` is missing, as it would for any other member of a missing
  object.

One caller-visible change: the message of a parse error now comes from `acorn`,
so `Unexpected token (1:6)` where `esprima` said `Line 1: Unexpected token ^`.
It is still a `SyntaxError`.
