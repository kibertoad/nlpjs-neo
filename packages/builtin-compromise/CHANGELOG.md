# @nlpjs-neo/builtin-compromise

## 5.2.0

### Minor Changes

- ee52ac1: Upgrade `compromise` from 13 to `^14.17.0` and `compromise-dates` from 1 to
  `^3.9.0`, and drop `compromise-numbers`, whose plugin was folded into
  `compromise` core in 14.
  
  Both packages are ESM-native in these versions, so the three
  `typeof x.default === 'function'` interop shims are gone and the only plugin
  left to register is `dates`.
  
  Two shapes changed inside the library and are mapped back, so the entities this
  package produces are unchanged:
  
  - `compromise-dates` 3 reports a match under `dates` rather than `date`.
  - `compromise` 14 reports a number as `number.num`, and no longer supplies the
    `cardinal`, `ordinal` and `textOrdinal` spellings the plugin added. A match is
    now recognised as an ordinal from the `Ordinal` tag on its terms, which avoids
    parsing the text a second time, and the `2nd`-style resolution value is
    formatted from the number.

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
