---
'@nlpjs-neo/utils': minor
'@nlpjs-neo/request': minor
'@nlpjs-neo/fullbot': minor
'@nlpjs-neo/api-auth-jwt': patch
'@nlpjs-neo/builtin-microsoft': patch
---

Upgrade the dependencies that carry security advisories, with no change to the
public API of any package.

- `tar` moves from 6 to `^7.5.22`, the only line that carries the fixes for the
  13 advisories against 6 and 4. A workspace-wide `tar` override pulls the copy
  under `@tensorflow/tfjs-node` onto the same version.
- `https-proxy-agent` and `http-proxy-agent` move from 5 to `^9.1.0`. Both now
  export a class, so a proxy URL has to be a full URL (`http://host:port`); a
  bare `host:port` string no longer parses.
- `archiver` moves from 5 to `^8.0.0`, which replaces the `archiver('zip')`
  factory with a `ZipArchive` class.
- `bcryptjs` moves to `^3.0.3` and `passport` to `^0.7.0`.
- `@microsoft/recognizers-text-suite` is no longer pinned exactly; it tracks
  `^1.3.1`.
