---
'@nlpjs-neo/evaluator': patch
---

Read and write a computed member by the value of its key. `a[k]` looked up the
property named `k` instead of the one `k` holds, in both `Evaluator` and
`JavascriptCompiler`.
