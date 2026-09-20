---
'@nlpjs-neo/lang-ja': patch
---

Tokenize Japanese with `@patdx/kuromoji` instead of `kuromoji`.

`kuromoji@0.1.2` was last released in 2018 and has a callback-only API.
`@patdx/kuromoji` is a typed, zero-dependency fork with the same tokenizer and
the same IPADIC dictionary, so tokens, readings and parts of speech are
unchanged; there is no change to any public API of this package.

The dictionary is now located by resolving the package entry point rather than
by probing three hard-coded `node_modules` paths, which was fragile under
pnpm's layout and under any hoisting scheme that is not npm's. The tokenizer
build is also shared between concurrent callers instead of being started once
per caller.
