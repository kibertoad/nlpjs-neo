---
'@nlpjs-neo/logger': minor
---

Upgrade `pino` from 7 to `^10.3.1` and `pino-pretty` from 7 to `^13.1.3`.

The constructor passed `prettyPrint` (deprecated in `pino` 7, removed in 8) and
`colorize`, which was never a `pino` option. `pino` 10 throws on `prettyPrint`,
and because this package builds its logger at import time, that throw would have
broken every import of `@nlpjs-neo/logger` -- and so of `@nlpjs-neo/basic`, which
re-exports it. Outside production the records now go through a `pino-pretty`
destination stream instead.

`pino-pretty` is wired up as a stream rather than as a `transport`, which is what
the `pino` documentation recommends for an application: a transport runs in a
worker thread, and a library that spawns one from module scope leaks a thread
into every process that imports it and loses records unless the caller flushes
on exit.

`Logger` now also accepts an optional destination stream and is exported
alongside the singleton, so callers can send records somewhere other than
stdout.
