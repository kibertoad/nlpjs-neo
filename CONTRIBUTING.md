# How to Contribute

## Reporting Issues

Should you run into issues with the project, please don't hesitate to let us know by
[filing an issue](https://github.com/kibertoad/nlpjs-neo/issues/new).

Pull requests containing only failing tests demonstrating an issue are also welcomed. Having these tests will help avoiding future regressions of this specific issue once it's fixed.

## Pull Requests

We accept [pull requests](https://github.com/kibertoad/nlpjs-neo/compare)!

Generally we like to see pull requests that:

- Maintain the existing code style
- Are focused on a single change (i.e. avoid large refactoring or style adjustments in untouched code if not the primary goal of the pull request)
- Have [conventional commits](https://conventionalcommits.org/)
- Have tests
- Don't decrease the current code coverage

## Building

The packages are written in TypeScript and compiled with [TypeScript 7](https://www.typescriptlang.org/)
to ESM plus type declarations in each package's `dist/` directory. The workspace is wired up
with project references, so a single build from the root compiles every package in dependency
order.

```shell
pnpm install
pnpm build
```

## Running tests

To run tests locally, first install all dependencies.

```shell
pnpm install
```

From the root directory, run the tests. Tests run against the TypeScript sources, so no build
is needed first.

```shell
pnpm test
```

## Running benchmarks

The benchmarks cover the hot paths of the main packages: the per-utterance pipeline
(normalizing, tokenizing, stemming, entity extraction, classification) and the training behind
it. They live in `packages/<package>/bench/` and run with

```shell
pnpm bench                     # every benchmark, once
pnpm bench packages/similarity # one package
```

`bench/README.md` covers the conventions, the shared fixtures and how to compare two runs with
`pnpm bench:compare`.

CI benchmarks a pull request only when it carries the `perf` label; adding the label starts
the run. The job runs the suite on the branch and on the base commit, back to back on the same
runner, prints the comparison to the job summary and fails if a benchmark got more than 30%
slower. A shared
runner is still a noisy place to measure, so anything subtler belongs on your own machine.

## Checking types and packaging

```shell
pnpm typecheck      # type-checks the package sources, the tests and the benchmarks
pnpm build          # compiles every package to dist/
pnpm check:exports  # are-the-types-wrong + publint for every package
```

`check:exports` inspects the packed tarballs, so run `pnpm build` before it.

### Typing the converted sources

The conversion from JavaScript was mechanical: it kept the original runtime behaviour and left
the types behind. Writing them down is done — every package describes its inputs and its
results, in its sources and in its tests — so `typescript/no-explicit-any` is an error and
`pnpm lint` fails on a new `any`. The compiler still runs without `strict` and with
`noImplicitAny` disabled; tightening those two is the next step, and it is a step at a time.

The shared vocabulary of the pipeline packages — tokens and token maps, settings, pipeline
input, the storage and logger contracts, the container registry types — lives in
`@nlpjs-neo/core`. A package that owns a domain keeps its own types in `src/types.ts` and
exports them from its index.

When you add to any of this:

- Put the types of a package in `src/types.ts` and export them from `src/index.ts`, so that
  consumers can name them.
- Where a value is only known at runtime, take the contract as a type argument instead of
  handing it back untyped: `container.get<Storage>('storage')` keeps the service locator
  dynamic and still types the call site.
- Where nothing is known, `unknown` is the answer. It says the same thing and makes the cast
  that follows visible.
- Five boundaries stay `any` on purpose, and each is a named type with a disable comment
  saying why: `PipelineResult`, `RehydratedInstance`, `ResolvedValue` and `ServiceConstructor`
  in `core`, and `EvaluatedValue` in `evaluator`. They are interpreters and service
  resolution, whose result only the caller knows. If you find you need another, name it the
  same way rather than spreading an `any` through a signature.

## Dependencies

`@types/node` deliberately tracks the `engines.node` floor (the 22 line) rather than the
latest release, so that the types cannot promise APIs the supported runtimes do not have.
Raise it together with the floor, not on its own.

`packages/request` still depends on `http-proxy-agent` and `https-proxy-agent`. Node 24
reads the proxy environment variables natively under `NODE_USE_ENV_PROXY`, so both come out
when the floor moves to 24.

## Changesets

Any pull request that changes published code needs a changeset. From the root directory:

```shell
pnpm changeset
```

Pick the packages you touched, pick a bump type for each, and write one line describing the
change. Commit the generated file in `.changeset/` along with your code. If the change is
internal only (tests, CI, docs), run `pnpm changeset add --empty` instead.

## Releases

Releases are automated. When a pull request with changesets lands on `main`, the Release
workflow opens a "Release Packages" pull request that applies the version bumps and writes the
changelog entries, then merges it. The follow-up run publishes the bumped packages to npm using
trusted publishing over GitHub OIDC, so no npm token is stored in this repository.
