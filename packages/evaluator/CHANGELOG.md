# @nlpjs-neo/evaluator

## 5.2.0

### Minor Changes

- ee52ac1: Replace `esprima` with `acorn` `^8.18.0` and `escodegen` with `astring` `^1.9.0`.
  
  `esprima` 4.0.1 dates from 2018 and understands nothing newer than ES2017, so
  any expression using syntax added since then was a parse error. Both libraries
  produce and consume ESTree and the walkers only ever called `parse(str)` and
  `generate(node)`, so the swap itself is mechanical; the acorn options live in one
  new `parse` module shared by `Evaluator` and `JavascriptCompiler`.
  
  The walkers gained the two features that make the new parser worth having:
  
  - `??`, including the short circuit that leaves the right term unevaluated when
    the left one is neither `null` nor `undefined`.
  - Optional chaining: `a?.b`, `a?.[b]` and `a?.()` short-circuit to `undefined`.
    Only a link that carries `?.` short-circuits, so `a?.b.c` still throws on the
    plain `.c` when `a` is missing, as it would for any other member of a missing
    object.
  
  One caller-visible change: the message of a parse error now comes from `acorn`,
  so `Unexpected token (1:6)` where `esprima` said `Line 1: Unexpected token ^`.
  It is still a `SyntaxError`.

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
