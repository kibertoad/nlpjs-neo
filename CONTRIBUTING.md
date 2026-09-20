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

## Checking types and packaging

```shell
pnpm typecheck      # type-checks the package sources and the tests
pnpm build          # compiles every package to dist/
pnpm check:exports  # are-the-types-wrong + publint for every package
```

`check:exports` inspects the packed tarballs, so run `pnpm build` before it.

### Migrating from JavaScript

The port from JavaScript was mechanical, so the compiler runs without `strict` and with
`noImplicitAny` disabled, and classes declare their instance properties as `any`. Tightening
this package by package is welcome: prefer replacing an `any` with a real type over adding new
ones.

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
