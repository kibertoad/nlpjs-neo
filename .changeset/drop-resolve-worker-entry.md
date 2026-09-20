---
'@nlpjs-neo/core': major
---

Remove `resolveWorkerEntry`. It was left over from the neural worker that this fork
dropped, nothing calls it, and it was the only reason `@nlpjs-neo/core` pulled `node:fs`
and `node:path` into a browser bundle.
