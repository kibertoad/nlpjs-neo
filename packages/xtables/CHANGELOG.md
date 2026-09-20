# @nlpjs-neo/xtables

## 6.0.0

### Major Changes

- 3fbcdd6: Read Excel with `@office-kit/xlsx` instead of SheetJS `xlsx`, which had no npm release
  since 2022 and carried two unfixed advisories (CVE-2023-30533, CVE-2024-22363).
  
  Breaking changes:
  
  - **Only `.xlsx` and `.xlsm` are read.** A `.xls` model needs a one-time conversion:
    Save As in Excel, or `soffice --headless --convert-to xlsx model.xls`. The other
    formats SheetJS accepted (`.xlsb`, `.ods`, `.csv`) are gone too. Passing one now
    rejects with a message that says so, rather than failing deeper in the reader.
  - **`XDoc.read`, `NlpExcelReader.load` and `NlpManager.loadExcel` return a promise** and
    must be awaited. `Recognizer.loadExcel` was already async and its signature is
    unchanged.
  - **`NlpManager.loadExcel()` with no argument now looks for `model.xlsx`**, not
    `model.xls`.
  
  Also fixed: `Recognizer.loadExcel` did not await the workbook load, so training could
  start before the model was read. That was latent while the load was synchronous and would
  have become a silent "model comes out empty" bug with this change.
  
  Improved: a number in `General` format now keeps its precision. SheetJS truncated the
  displayed text to 11 characters, so `0.990566037735849` reached a model as
  `0.990566038` and the rest of the value was simply lost. `@office-kit/xlsx` keeps 15
  significant digits, which is what the cell actually holds.
  
  This is visible to anyone whose workbook has a computed decimal column: those values
  arrive longer and more accurate than before. Strings and integers are unchanged. If you
  were relying on the old truncation as rounding, round explicitly where you consume the
  value.

## 5.1.1

### Patch Changes

- de4fb22: Point the package metadata at the fork: `repository`, `bugs` and `homepage` now name
  `kibertoad/nlpjs-neo` instead of `axa-group/nlp.js`, `author` and `maintainers` name the
  fork's current maintainer with the original author kept as a contributor, and every
  `lang-*` package describes the language it supports rather than calling itself "Core".

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
