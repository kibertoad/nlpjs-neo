---
'@nlpjs-neo/request-rn': major
'@nlpjs-neo/request': minor
'@nlpjs-neo/builtin-duckling': minor
'@nlpjs-neo/directline-connector': minor
'@nlpjs-neo/fullbot': minor
'@nlpjs-neo/utils': patch
'@nlpjs-neo/api-auth-jwt': patch
---

Replace dependencies that Node has covered with built-ins since the engine
floor of 22.12.

- `@nlpjs-neo/request-rn` no longer depends on `axios`; it is built on the
  global `fetch`, which both Node and React Native provide. The option shape
  (`url`, `method`, `data`, `params`, `headers`) and the rejection on an error
  status are unchanged, but a thrown error is now a plain `Error` carrying
  `status` and `data` rather than an `AxiosError`.
- `@nlpjs-neo/directline-connector` no longer depends on `node-fetch`.
- `@nlpjs-neo/fullbot` no longer depends on `rimraf`; `removeDir` uses
  `fs.rmSync`.
- `@nlpjs-neo/request` and `@nlpjs-neo/builtin-duckling` no longer use the
  deprecated `url.parse` or `querystring`. Two consequences for `request`: a
  url-encoded body now encodes a space as `+` instead of `%20` (both decode
  identically), and the form content type is now the correct
  `application/x-www-form-urlencoded` rather than the misspelled
  `application/x-wwww-form-urlencoded`.
- `Content-Length` is measured in bytes in both packages, so a body with
  non-ASCII characters is no longer truncated.
