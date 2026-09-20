# @nlpjs-neo/core-loader

## 6.0.0

### Major Changes

- 48a7f45: Drop the plugin entries for the packages removed in the September 2026 package
  cull.
  
  Every package in `packages/` was measured against its weekly download count on
  the pre-fork `@nlpjs` namespace, since `@nlpjs-neo` is not published yet and so
  carries no signal of its own. The 25 packages under 200 weekly downloads had no
  dependents among the packages that stayed, so they came out together, and these
  13 names no longer resolve from a `conf.json`:
  
  `ApiAuthJwt`, `Bot`, `BuiltinCompromise`, `Database`, `DirectlineConnector`,
  `ExpressApiServer`, `ExpressApiServerless`, `FbConnector`, `Mongodb`,
  `MongodbAdapter`, `MsbfConnector`, `NluLuis`, `Qna`.
  
  A container that names any of them fails to load, so this is breaking for anyone
  whose configuration used the bot, connector or API-server plugins.
  `ConsoleConnector` is unaffected and remains the supported way to talk to a bot.

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
  - @nlpjs-neo/request@5.1.0

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
  - @nlpjs-neo/request@5.0.0
