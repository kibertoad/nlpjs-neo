# @nlpjs-neo/mongodb-adapter

## 6.0.0

### Major Changes

- ee52ac1: Upgrade `mongodb` from 3 to `^7.6.0` and rewrite the adapter for it.
  
  Every major since 4 was breaking, and the adapter used three things that are
  gone:
  
  - `useNewUrlParser` and `useUnifiedTopology`, removed in driver 4. Both are the
    only behaviour now, so the options are dropped.
  - Callbacks, removed in driver 5. `connect` and every collection operation are
    awaited, and `executeInCollection` no longer wraps a callback in a promise.
    `disconnect` returns a promise as well, and clears the connection so a later
    call reports the adapter as not initialized.
  - `insertOne` returning `result.ops[0]`, removed in driver 4. The generated id
    comes back as `result.insertedId` and is merged into the stored document.
  
  Replacing the hand-written callback mocks in the test suite with a real `mongod`
  turned up four defects the mocks had hidden:
  
  - `insertMany` answered with the driver's own result -- counts and ids -- rather
    than the inserted documents, so no caller could read back what it stored. It
    now answers like `insertOne`, with the documents.
  - `save` on an existing item answered with the raw `updateOne` result, which
    carries no document. It now answers with the saved item.
  - `convertOut` turned a document that was not found into an empty object, which
    reads as a hit. It now passes `null` through, which also repairs `save`: an
    item carrying a well formed id that nothing is stored under was taking the
    update path and silently storing nothing, and is now inserted.
  - `convertIn` converted the elements of an array with `convertOut`, so an
    explicit `id` on a bulk insert was dropped and replaced by a generated one.
  
  Two smaller fixes: `connect` used `this.dbName`, which is never assigned, so the
  database came from the connection string whatever `settings.dbName` said; and
  `settings.dbName`, when derived from the url, took a query string with it. Both
  are corrected.
  
  Driver 7 rejects an undefined url where driver 3 accepted it, and the container
  builds this adapter from configuration before a url is necessarily known, so the
  client is only built once there is a url and `connect` reports a missing one with
  a clear message.

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
  - @nlpjs-neo/core@5.0.0
