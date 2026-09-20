---
'@nlpjs-neo/request': patch
---

Note in the source that both proxy-agent dependencies come out once the engine floor moves
to Node 24, which reads the proxy environment variables natively under
`NODE_USE_ENV_PROXY`. No behaviour change.
