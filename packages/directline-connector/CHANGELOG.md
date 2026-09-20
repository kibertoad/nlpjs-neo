# @nlpjs-neo/directline-connector

## 5.2.0

### Minor Changes

- 6476876: Upgrade `formidable` from 2 to `^3.5.4`, and repair the upload route.
  
  The handler read `files.activity.path`, which formidable renamed to `filepath`
  in version 2, so `POST /directline/conversations/:conversationId/upload` threw
  for every request. Version 3 also groups every field into an array and resolves
  from `form.parse` instead of taking a callback, so the handler now reads
  `files.activity[0].filepath` and awaits the parse.
  
  The route gains an integration suite, and two behaviour improvements come with
  it: the upload folder is created if it does not exist, and temporary files are
  removed on the error path too, not only on success.
- 6476876: Replace dependencies that Node has covered with built-ins since the engine
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

## 5.1.0

### Minor Changes

- 468d66f: Migrate the sources to TypeScript and publish compiled ESM with bundled type
  declarations.
  
  Every package is now written in TypeScript, compiled with TypeScript 7 and published from
  `dist/` as ES modules alongside `.d.ts`, `.d.ts.map` and `.js.map` files, so consumers get
  types and working go-to-definition out of the box. The `exports` map gained a `types`
  condition and the packages declare `files` so only the build output ships.
  
  There is no CommonJS build, as before. The public API is unchanged, apart from three latent
  bugs that the type checker surfaced: `BaseStemmer` now implements the `copy_from` that every
  generated stemmer chains up to, `MemorydbAdapter.find` no longer misspells `conditionKeys.length`,
  and `StemmerTl.removeInfix` no longer compares its loop condition against `0`.

### Patch Changes

- Updated dependencies [468d66f]
  - @nlpjs-neo/connector@5.1.0
  - @nlpjs-neo/core@5.1.0

## 5.0.0

### Major Changes

- aad1f0d: Convert every package to ESM only
  
  The packages are now published as ES modules with no CommonJS build. `require()` of any
  `@nlpjs-neo/*` package, of `node-nlp-neo` or of `node-nlp-rn` no longer works; import them
  instead, or use a dynamic `import()` from CommonJS.
  
  - Every package declares `"type": "module"` and an `exports` map pointing at `./src/index.js`.
  - The minimum supported Node.js version is now 22.12, the first release where `require()` can
    load an ES module. Plugins passed to `containerBootstrap` by path are still loaded
    synchronously, through `createRequire`, and a plugin file that has a single default export is
    unwrapped so it keeps behaving like the CommonJS `module.exports = Plugin` it replaces.
  - Bot resources loaded by `FullBot` (actions, validators and cards) are now read with dynamic
    `import()`. A file with only a default export is unwrapped the same way.
  - `@nlpjs-neo/core` exported a `loadEnv` binding its helper never defined, so it was always
    `undefined`; it now exports `loadEnvFromJson`, which is what the helper provides and what
    `@nlpjs-neo/core-loader` expects.

### Patch Changes

- Updated dependencies [aad1f0d]
  - @nlpjs-neo/connector@5.0.0
  - @nlpjs-neo/core@5.0.0
