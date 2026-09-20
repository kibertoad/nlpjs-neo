# @nlpjs-neo/similarity

## 5.2.1

### Patch Changes

- 8a2ba07: Complete the publishing metadata of every package: a `prepublishOnly` hook that compiles
  the package so a manual publish can never ship a stale `dist`, `publishConfig.access`, npm
  keywords, `repository.directory`, fuller descriptions, and a `files` field that ships the
  README, the licence and the changelog while leaving the TypeScript build cache behind.

## 5.2.0

### Minor Changes

- e059a1c: Describe the API of the core packages with real types instead of `any`.
  
  The conversion from JavaScript left the classes declaring their fields and
  returning `any`, so every consumer started from an untyped value. `core`,
  `similarity`, `neural`, `slot` and `sentiment` now say what they have always
  produced at runtime, and export the types they use.
  
  `@nlpjs-neo/core` gains a `types.ts` holding the vocabulary shared by the
  pipeline packages: tokens and token maps, settings, the pipeline input, the
  storage and logger contracts, the per-locale service contracts, and the
  compiler, pipeline and registry types of the container. `Container`,
  `Clonable`, `Context`, `MemoryStorage` and the tokenizing, stemming,
  stopword, normalizing and timing stages are typed against it, and
  `Container.get` takes the expected contract as a type argument, so
  `container.get<Storage>('storage')` types the call site without freezing the
  service locator. `core-loader` and `basic` re-export the new types.
  
  `similarity` carries term frequency maps and vectors through, and
  `SpellCheck.check` keeps the value type of the map form. `neural` describes
  the corpus, the sparse vectors, the training status, the perceptrons and the
  exported model, so `run` returns scores by intent, `explain` returns the
  weights behind one, and `toJSON` returns what `fromJSON` accepts. `slot`
  describes a slot, the state carried between turns and the result it
  completes. `sentiment` describes the dictionaries a locale can provide and
  the sentiment of an utterance.
  
  Nothing changes at runtime. Path resolution, pipeline execution and JSON
  rehydration stay `any` on purpose: they are interpreters whose result only
  the caller knows, and each is commented as such. TypeScript consumers that
  were passing values of the wrong shape into these APIs will now see an error
  where they previously saw `any`.

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
