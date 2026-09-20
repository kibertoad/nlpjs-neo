---
'@nlpjs-neo/core': minor
'@nlpjs-neo/core-loader': minor
'@nlpjs-neo/basic': minor
'@nlpjs-neo/similarity': minor
'@nlpjs-neo/neural': minor
'@nlpjs-neo/slot': minor
'@nlpjs-neo/sentiment': minor
---

Describe the API of the core packages with real types instead of `any`.

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
