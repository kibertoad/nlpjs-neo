# @nlpjs-neo/lang-all

## 5.1.2

### Patch Changes

- 8a2ba07: Complete the publishing metadata of every package: a `prepublishOnly` hook that compiles
  the package so a manual publish can never ship a stale `dist`, `publishConfig.access`, npm
  keywords, `repository.directory`, fuller descriptions, and a `files` field that ships the
  README, the licence and the changelog while leaving the TypeScript build cache behind.
- Updated dependencies [8a2ba07]
  - @nlpjs-neo/core@6.1.1
  - @nlpjs-neo/lang-ar@5.1.2
  - @nlpjs-neo/lang-bn@5.1.2
  - @nlpjs-neo/lang-ca@5.1.2
  - @nlpjs-neo/lang-cs@5.1.2
  - @nlpjs-neo/lang-da@5.1.2
  - @nlpjs-neo/lang-de@5.1.2
  - @nlpjs-neo/lang-el@5.1.2
  - @nlpjs-neo/lang-en@5.1.2
  - @nlpjs-neo/lang-es@5.1.2
  - @nlpjs-neo/lang-eu@5.1.2
  - @nlpjs-neo/lang-fa@5.1.2
  - @nlpjs-neo/lang-fi@5.1.2
  - @nlpjs-neo/lang-fr@5.1.2
  - @nlpjs-neo/lang-ga@5.1.2
  - @nlpjs-neo/lang-gl@5.1.2
  - @nlpjs-neo/lang-hi@5.1.2
  - @nlpjs-neo/lang-hu@5.1.2
  - @nlpjs-neo/lang-hy@5.1.2
  - @nlpjs-neo/lang-id@5.1.2
  - @nlpjs-neo/lang-it@5.1.2
  - @nlpjs-neo/lang-ja@5.1.3
  - @nlpjs-neo/lang-ko@5.1.2
  - @nlpjs-neo/lang-lt@5.1.2
  - @nlpjs-neo/lang-ms@5.1.2
  - @nlpjs-neo/lang-ne@5.1.2
  - @nlpjs-neo/lang-nl@5.1.2
  - @nlpjs-neo/lang-no@5.1.2
  - @nlpjs-neo/lang-pl@5.1.2
  - @nlpjs-neo/lang-pt@5.1.2
  - @nlpjs-neo/lang-ro@5.1.2
  - @nlpjs-neo/lang-ru@5.1.2
  - @nlpjs-neo/lang-sl@5.1.2
  - @nlpjs-neo/lang-sr@5.1.2
  - @nlpjs-neo/lang-sv@5.1.2
  - @nlpjs-neo/lang-ta@5.1.2
  - @nlpjs-neo/lang-th@5.1.2
  - @nlpjs-neo/lang-tl@5.1.2
  - @nlpjs-neo/lang-tr@5.1.2
  - @nlpjs-neo/lang-uk@5.1.2
  - @nlpjs-neo/lang-zh@5.1.2
  - @nlpjs-neo/language@5.1.2

## 5.1.1

### Patch Changes

- de4fb22: Point the package metadata at the fork: `repository`, `bugs` and `homepage` now name
  `kibertoad/nlpjs-neo` instead of `axa-group/nlp.js`, `author` and `maintainers` name the
  fork's current maintainer with the original author kept as a contributor, and every
  `lang-*` package describes the language it supports rather than calling itself "Core".
- Updated dependencies [de4fb22]
- Updated dependencies [de4fb22]
  - @nlpjs-neo/core@6.0.0
  - @nlpjs-neo/lang-ar@5.1.1
  - @nlpjs-neo/lang-bn@5.1.1
  - @nlpjs-neo/lang-ca@5.1.1
  - @nlpjs-neo/lang-cs@5.1.1
  - @nlpjs-neo/lang-da@5.1.1
  - @nlpjs-neo/lang-de@5.1.1
  - @nlpjs-neo/lang-el@5.1.1
  - @nlpjs-neo/lang-en@5.1.1
  - @nlpjs-neo/lang-es@5.1.1
  - @nlpjs-neo/lang-eu@5.1.1
  - @nlpjs-neo/lang-fa@5.1.1
  - @nlpjs-neo/lang-fi@5.1.1
  - @nlpjs-neo/lang-fr@5.1.1
  - @nlpjs-neo/lang-ga@5.1.1
  - @nlpjs-neo/lang-gl@5.1.1
  - @nlpjs-neo/lang-hi@5.1.1
  - @nlpjs-neo/lang-hu@5.1.1
  - @nlpjs-neo/lang-hy@5.1.1
  - @nlpjs-neo/lang-id@5.1.1
  - @nlpjs-neo/lang-it@5.1.1
  - @nlpjs-neo/lang-ja@5.1.1
  - @nlpjs-neo/lang-ko@5.1.1
  - @nlpjs-neo/lang-lt@5.1.1
  - @nlpjs-neo/lang-ms@5.1.1
  - @nlpjs-neo/lang-ne@5.1.1
  - @nlpjs-neo/lang-nl@5.1.1
  - @nlpjs-neo/lang-no@5.1.1
  - @nlpjs-neo/lang-pl@5.1.1
  - @nlpjs-neo/lang-pt@5.1.1
  - @nlpjs-neo/lang-ro@5.1.1
  - @nlpjs-neo/lang-ru@5.1.1
  - @nlpjs-neo/lang-sl@5.1.1
  - @nlpjs-neo/lang-sr@5.1.1
  - @nlpjs-neo/lang-sv@5.1.1
  - @nlpjs-neo/lang-ta@5.1.1
  - @nlpjs-neo/lang-th@5.1.1
  - @nlpjs-neo/lang-tl@5.1.1
  - @nlpjs-neo/lang-tr@5.1.1
  - @nlpjs-neo/lang-uk@5.1.1
  - @nlpjs-neo/lang-zh@5.1.1
  - @nlpjs-neo/language@5.1.1

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
  - @nlpjs-neo/lang-ar@5.1.0
  - @nlpjs-neo/lang-bn@5.1.0
  - @nlpjs-neo/lang-ca@5.1.0
  - @nlpjs-neo/lang-cs@5.1.0
  - @nlpjs-neo/lang-da@5.1.0
  - @nlpjs-neo/lang-de@5.1.0
  - @nlpjs-neo/lang-el@5.1.0
  - @nlpjs-neo/lang-en@5.1.0
  - @nlpjs-neo/lang-es@5.1.0
  - @nlpjs-neo/lang-eu@5.1.0
  - @nlpjs-neo/lang-fa@5.1.0
  - @nlpjs-neo/lang-fi@5.1.0
  - @nlpjs-neo/lang-fr@5.1.0
  - @nlpjs-neo/lang-ga@5.1.0
  - @nlpjs-neo/lang-gl@5.1.0
  - @nlpjs-neo/lang-hi@5.1.0
  - @nlpjs-neo/lang-hu@5.1.0
  - @nlpjs-neo/lang-hy@5.1.0
  - @nlpjs-neo/lang-id@5.1.0
  - @nlpjs-neo/lang-it@5.1.0
  - @nlpjs-neo/lang-ja@5.1.0
  - @nlpjs-neo/lang-ko@5.1.0
  - @nlpjs-neo/lang-lt@5.1.0
  - @nlpjs-neo/lang-ms@5.1.0
  - @nlpjs-neo/lang-ne@5.1.0
  - @nlpjs-neo/lang-nl@5.1.0
  - @nlpjs-neo/lang-no@5.1.0
  - @nlpjs-neo/lang-pl@5.1.0
  - @nlpjs-neo/lang-pt@5.1.0
  - @nlpjs-neo/lang-ro@5.1.0
  - @nlpjs-neo/lang-ru@5.1.0
  - @nlpjs-neo/lang-sl@5.1.0
  - @nlpjs-neo/lang-sr@5.1.0
  - @nlpjs-neo/lang-sv@5.1.0
  - @nlpjs-neo/lang-ta@5.1.0
  - @nlpjs-neo/lang-th@5.1.0
  - @nlpjs-neo/lang-tl@5.1.0
  - @nlpjs-neo/lang-tr@5.1.0
  - @nlpjs-neo/lang-uk@5.1.0
  - @nlpjs-neo/lang-zh@5.1.0
  - @nlpjs-neo/language@5.1.0

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
  - @nlpjs-neo/lang-ar@5.0.0
  - @nlpjs-neo/lang-bn@5.0.0
  - @nlpjs-neo/lang-ca@5.0.0
  - @nlpjs-neo/lang-cs@5.0.0
  - @nlpjs-neo/lang-da@5.0.0
  - @nlpjs-neo/lang-de@5.0.0
  - @nlpjs-neo/lang-el@5.0.0
  - @nlpjs-neo/lang-en@5.0.0
  - @nlpjs-neo/lang-es@5.0.0
  - @nlpjs-neo/lang-eu@5.0.0
  - @nlpjs-neo/lang-fa@5.0.0
  - @nlpjs-neo/lang-fi@5.0.0
  - @nlpjs-neo/lang-fr@5.0.0
  - @nlpjs-neo/lang-ga@5.0.0
  - @nlpjs-neo/lang-gl@5.0.0
  - @nlpjs-neo/lang-hi@5.0.0
  - @nlpjs-neo/lang-hu@5.0.0
  - @nlpjs-neo/lang-hy@5.0.0
  - @nlpjs-neo/lang-id@5.0.0
  - @nlpjs-neo/lang-it@5.0.0
  - @nlpjs-neo/lang-ja@5.0.0
  - @nlpjs-neo/lang-ko@5.0.0
  - @nlpjs-neo/lang-lt@5.0.0
  - @nlpjs-neo/lang-ms@5.0.0
  - @nlpjs-neo/lang-ne@5.0.0
  - @nlpjs-neo/lang-nl@5.0.0
  - @nlpjs-neo/lang-no@5.0.0
  - @nlpjs-neo/lang-pl@5.0.0
  - @nlpjs-neo/lang-pt@5.0.0
  - @nlpjs-neo/lang-ro@5.0.0
  - @nlpjs-neo/lang-ru@5.0.0
  - @nlpjs-neo/lang-sl@5.0.0
  - @nlpjs-neo/lang-sr@5.0.0
  - @nlpjs-neo/lang-sv@5.0.0
  - @nlpjs-neo/lang-ta@5.0.0
  - @nlpjs-neo/lang-th@5.0.0
  - @nlpjs-neo/lang-tl@5.0.0
  - @nlpjs-neo/lang-tr@5.0.0
  - @nlpjs-neo/lang-uk@5.0.0
  - @nlpjs-neo/lang-zh@5.0.0
  - @nlpjs-neo/language@5.0.0
