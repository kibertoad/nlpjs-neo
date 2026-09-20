# Dependency audit, September 2026

Status: in progress. Written 2026-09-20 against the `pnpm-lock.yaml` on `main`
(commit `7f49b81`), and kept up to date as the work lands. The Status column of the
recommendations table and the checklist under "Suggested order of work" are the record of
what is done; **Progress log** at the end of the document records each landed step,
including the places where the original finding turned out to be wrong.

Items 1 to 4, 7, 8, 16, 19 to 24 are done. `pnpm audit` is down from 51 advisories
(3 critical, 23 high, 24 moderate, 1 low) to 6 (4 high, 2 moderate), all of which belong
to items 5, 6, 9 and 10.

Scope: every third-party dependency declared in the root `package.json` and in
`packages/*/package.json`. The `examples/` folders are not part of the pnpm workspace and
are covered briefly at the end. Version data comes from the npm registry on the audit date.

## Baseline

| Item | Value |
| --- | --- |
| Node floor (`engines.node`) | `>=22.12.0` |
| CI matrix | Node 22.x, 24.x, 26.x |
| Package manager | pnpm 11.25.0 |
| Module system | ESM only, TypeScript 7, `module: nodenext` |
| `pnpm audit` result at the time of writing | 51 advisories: 3 critical, 23 high, 24 moderate, 1 low |
| `pnpm audit` result now | 6 advisories: 4 high, 2 moderate |

The toolchain itself is current: `typescript` 7.0.2, `vitest` 5.0.1, `@vitest/coverage-v8`
5.0.1, `oxlint` 1.83.0, `oxfmt` 0.68.0, `@changesets/cli` 3.0.3, `publint` 0.3.24 and
`@arethetypeswrong/cli` 0.18.5 are all at their latest release. `@types/node` is pinned to
the 22 line on purpose: it matches the engine floor, so keep it there rather than moving to 26.

## Summary of recommendations

Ordered by how much risk each item removes per unit of work.

| # | Dependency | Package(s) | Finding | Recommendation | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | `tar` 6.2.1 | utils (and 4.4.19 via tfjs-node) | 13 advisories, 1 critical, fixed only in 7.5.x | Upgrade to `^7.5.22`, add a pnpm override for the tfjs-node path | Done |
| 2 | `axios` 0.26.1 | request-rn | 23 advisories | Replace with global `fetch` | Done |
| 3 | `decompress` 4.2.1 | fullbot | Critical zip-slip, no fixed version, last release 2020 | Replace with `node-stream-zip` | Done |
| 4 | `coveralls` 3.1.1 | root dev | Unmaintained, pulls `request` 2.88 with 7 advisories, not used by CI | Remove | Done |
| 5 | `xlsx` 0.18.5 | xtables | Two unfixed CVEs on npm, no npm releases since 2022 | Follow `docs/migrate-sheetjs-to-office-kit.md` | Open |
| 6 | `@tensorflow/tfjs-node` 3.21.1 | open-question | Two majors behind, project in maintenance mode, drags in vulnerable `tar` 4, `adm-zip` 0.5, `rimraf` 2, `https-proxy-agent` 2 | Migrate to `@huggingface/transformers`; bump to `^4.22` as a stopgap | Open |
| 7 | `node-fetch` 2.6.7 | directline-connector | Node has had `fetch` since 18 | Remove, use global `fetch` | Done |
| 8 | `rimraf` 3.0.2 | fullbot | Node has `fs.rmSync` since 14.14 | Remove, use `fs.rmSync` | Done |
| 9 | `actions-on-google` 3.0.0 | dialogflow-connector | Platform shut down June 2023, library archived | Retire the package or rewrite as a plain Dialogflow ES webhook | Open |
| 10 | `botbuilder-adapter-facebook` 1.0.12 | fb-connector | Botkit adapter, last release 2022, pulls all of Botkit and Bot Framework | Replace with a small Graph API client on `fetch` | Open |
| 11 | `serverless-express` 2.0.12 | express-api-serverless | Abandoned fork, last release 2021 | Replace with `@codegenie/serverless-express` | Open |
| 12 | `esprima` 4.0.1 + `escodegen` 2.1.0 | evaluator | Parser frozen since 2018, no ES2020+ syntax | Replace with `acorn` + `astring` | Open |
| 13 | `mongodb` 3.7.4 | mongodb-adapter | Four majors behind, uses removed APIs | Upgrade to `^7.6.0` and update the adapter | Open |
| 14 | `compromise` 13 + `compromise-numbers` + `compromise-dates` 1 | builtin-compromise | One major behind, numbers plugin folded into core | Upgrade to `compromise` 14 + `compromise-dates` 3, drop `compromise-numbers` | Open |
| 15 | `pino` 7 + `pino-pretty` 7 | logger | Three and six majors behind, `prettyPrint` option no longer exists | Upgrade and switch to `transport` | Open |
| 16 | `https-proxy-agent` 5 + `http-proxy-agent` 5 | request, utils, root dev | Four majors behind; Node 24 has built-in env proxy support | Upgrade to `^9.1.0` now, drop once the floor is Node 24 | Done (upgraded; removal waits for Node 24) |
| 17 | `kuromoji` 0.1.2 | lang-ja | Last release 2018, callback API, dictionary path hand-resolved | Switch to `@patdx/kuromoji` | Open |
| 18 | `express` 4 | express-api-server | One major behind, still patched | Upgrade to 5 when convenient, one line to verify | Open |
| 19 | `formidable` 2 | directline-connector | One major behind | Upgrade to `^3.5.4` | Done |
| 20 | `archiver` 5 | fullbot | Three majors behind | Upgrade to `^8.0.0` | Done |
| 21 | `bcryptjs` 2 | api-auth-jwt | One major behind; Node `crypto.scrypt` is native | Upgrade to 3, or move to `scrypt` | Done (upgraded to 3; scrypt not adopted) |
| 22 | `supertest` 6 | root dev, express-api-server dev | One major behind, declared twice | Upgrade to 7, keep only the package-level declaration | Done |
| 23 | `passport` 0.6 | api-auth-jwt | Minor behind; whole stack is optional for two strategies | Upgrade to 0.7, consider dropping passport | Done (upgraded to 0.7; passport kept) |
| 24 | `@microsoft/recognizers-text-suite` 1.3.0 | builtin-microsoft | Pinned exactly, patch behind | Change to `^1.3.1` | Done |
| 25 | `exceljs` 4.4.0 | utils | Last release 2023, deprecated transitive chain | Consolidate onto `@office-kit/xlsx` after item 5 | Open |

## Findings in detail

### 1. Security: fix now

#### `tar` ^6.0.2 (resolved 6.2.1) in `@nlpjs-neo/utils`

The lockfile resolves to 6.2.1 here and to 4.4.19 under `@tensorflow/tfjs-node`. The audit
reports 13 advisories against the two, including path traversal via hardlinks and symlink
chains, a decompression denial of service rated critical, and several crash bugs. All fixes
landed in the 7.5.x line only (7.5.8 through 7.5.21). Latest is 7.5.22 (July 2026), which
requires Node 18 or later.

Done. `Downloader` called `tar.x({ file, strip, C })`. The 7.x API is the same, but the
package is ESM and TypeScript native, so the default import becomes a named import:

```ts
import { extract } from 'tar';
await extract({ file: absolutePath, strip: 1, cwd: downloadDir });
```

There is no Node built-in for tar, so this stays a dependency.

Upgrading `utils` clears only its own path. The 4.4.19 copy under `tfjs-node` (and the
`^6.2.1` range that `tfjs-node` 4.22.0 still declares) stays flagged until item 6 lands.
Until then, force the whole tree onto one fixed version in `pnpm-workspace.yaml`:

```yaml
overrides:
  tar: ^7.5.22
```

`tfjs-node` touches `tar` only in its install script (`scripts/resources.js`), which pipes a
download through `tar.x({ C, strict: true })`. Both the `x` alias and the `C` option are
still supported in 7.x, and the package is dual CommonJS/ESM, so the override is safe.

#### `axios` ^0.26.0 (resolved 0.26.1) in `@nlpjs-neo/request-rn`

23 advisories, from SSRF and credential leakage to prototype pollution and ReDoS. The
package exists so that React Native builds have an HTTP client. React Native ships `fetch`,
and Node has had a global `fetch` since 18, so the whole file reduces to:

```ts
async function request(options: string | RequestOptions) {
  const { url, method = 'GET', headers, body } =
    typeof options === 'string' ? { url: options } : options;
  const response = await fetch(url, { method, headers, body });
  const text = await response.text();
  try { return JSON.parse(text); } catch { return text; }
}
```

This removes the dependency, the CommonJS interop shim at the top of the file and the
`AxiosStatic` cast. If the axios option shape (`data`, `params`) must be preserved for
API compatibility, map those two fields before calling `fetch`.

#### `decompress` ^4.2.1 in `@nlpjs-neo/fullbot`

Three advisories, one critical (arbitrary file write outside the target directory). There is
no patched version; the last release was April 2020. `fullbot` uses it once, to unzip a
downloaded model archive into a folder.

Recommended replacement: `node-stream-zip` 1.16.0 (July 2026, zero dependencies, async
API, guards against entries that escape the target directory):

```ts
import StreamZip from 'node-stream-zip';

async function restore(fileName: string, tgtFolder: string) {
  const zip = new StreamZip.async({ file: fileName });
  try {
    await zip.extract(null, tgtFolder);
  } finally {
    await zip.close();
  }
}
```

Alternatives considered: `yauzl` 3.4.0 (maintained, streaming, but leaves path safety to
the caller), `adm-zip` 0.6.1 (patched this month, but a long history of extraction CVEs),
`fflate` 0.8.3 (in-memory only, fine for small archives). There is no zip support in Node
core.

Done, with one behaviour change worth knowing about: `node-stream-zip` rejects on an
archive it cannot read, where `decompress` resolved with an empty list. `mount` depends on
that rejection to roll back to its backup, so before this change a corrupt download left
the bot folder empty.

#### `coveralls` ^3.1.0 (dev, root)

Last release June 2021. It depends on `request` 2.88.2, which is deprecated and pulls
vulnerable versions of `form-data`, `tough-cookie`, `uuid` and `qs`. Seven of the 51 audit
advisories come from this chain (the `uuid` one also reaches the tree through `botbuilder`,
so it will remain until that package updates).

The `coveralls` npm script is not run by either workflow in `.github/workflows`. Remove the
package and the script. If Coveralls reporting is wanted again, use the
`coverallsapp/github-action` action, which needs no npm package, or `coveralls-next` 6.0.2.

#### `xlsx` ^0.18.0 in `@nlpjs-neo/xtables`

0.18.5 is the last SheetJS release on npm (March 2022). It carries CVE-2023-30533
(prototype pollution) and CVE-2024-22363 (ReDoS). Fixed builds are only distributed from
the vendor's own CDN. A migration plan to `@office-kit/xlsx` already exists in
`docs/migrate-sheetjs-to-office-kit.md`. That plan was written against 0.18.0; the library
is now at 0.21.0 (September 2026, MIT, Node 22 floor), so re-check the `io` entry point
before starting. Nothing in this audit changes the plan's conclusions.

### 2. Unsupported or abandoned: replace

#### `@tensorflow/tfjs-node` ^3.0.0 (resolved 3.21.1) in `@nlpjs-neo/open-question`

The range is two majors behind the latest 4.22.0, itself from October 2024. TensorFlow.js
is in maintenance mode and the Node binding downloads a prebuilt N-API 3 through 8 binary
at install time, or compiles from source when none matches. It is the reason
`allowBuilds` exists in `pnpm-workspace.yaml`.

It is also the largest source of transitive debt in the lockfile: `tar` 4.4.19,
`adm-zip` 0.5.18, `rimraf` 2.7.1, `https-proxy-agent` 2.2.4 and `node-fetch` 2.6.13 all
enter through it. The 4.22.0 release still declares `tar ^6.2.1`, `adm-zip ^0.5.2` and
`https-proxy-agent ^2.2.1`, so bumping only trims, not clears, that list.

`open-question` uses it for one thing: loading a saved BERT model with
`tf.node.getMetaGraphsFromSavedModel` and running question answering. The strictly better
alternative today is `@huggingface/transformers` 4.3.0 (September 2026, pure npm, ESM,
ONNX Runtime under the hood, no native build step). Its `question-answering` pipeline covers
this package's use case directly and can load the same family of BERT checkpoints in ONNX
form. That is a rewrite of `runtime.ts` and `runtime-thread.ts` plus a model conversion, so
it is the largest item in this audit. If it cannot be scheduled soon, bump to `^4.22.0` as
a stopgap to at least drop `tar` 4.

#### `actions-on-google` ^3.0.0 in `@nlpjs-neo/dialogflow-connector`

Google shut down Conversational Actions on 13 June 2023 and archived this SDK; 3.0.0
(August 2021) is its final release. The connector is 91 lines that build a `dialogflow()`
app and register intent handlers.

Two options:

- Retire `@nlpjs-neo/dialogflow-connector`. The platform it targets no longer exists.
- Keep a Dialogflow ES integration by handling the fulfillment webhook JSON directly with
  Express. The request and response shapes are small and documented, and no SDK is required.
  `@google-cloud/dialogflow` 8.1.0 is the maintained client library, but it is for calling
  the Dialogflow API, not for serving fulfillment, so it is not a drop-in.

#### `botbuilder-adapter-facebook` ^1.0.11 in `@nlpjs-neo/fb-connector`

A Botkit adapter, last released March 2022. It depends on `botkit` 4.15, which in turn
depends on the full Bot Framework stack, so this one line brings `botbuilder`,
`botbuilder-dialogs`, `botframework-connector`, the Azure SDK and `@typespec/ts-http-runtime`
into every install of `fb-connector`.

The connector uses `FacebookAdapter` for three things: webhook signature verification, turning
an incoming Messenger event into an activity, and sending a reply through the Graph API.
Each is a short piece of code on top of `fetch` and `node:crypto`. Rewriting the adapter in
about 100 lines removes both `botbuilder-adapter-facebook` and `botbuilder` from
`fb-connector`. `botbuilder` 4.23.3 itself is current and stays in `msbf-connector`.

#### `serverless-express` ^2.0.11 in `@nlpjs-neo/express-api-serverless`

This is an individual's fork, last published September 2021. The maintained project is
`@codegenie/serverless-express` (formerly `@vendia/serverless-express`). Its 5.0.0 (April
2026) requires Node 24; 4.17.1 (December 2025) supports Node 18 and later, so pin `^4.17.1`
while the floor is 22 and move to 5 when the floor moves to 24.

Note the API is different: the current package wraps `express` itself, while
`@codegenie/serverless-express` wraps an existing Express app in a Lambda handler:

```ts
import serverlessExpress from '@codegenie/serverless-express';
export const handler = serverlessExpress({ app });
```

`ExpressApiServerless` should build the app with plain `express` (already a dependency of
the sibling package) and expose the handler.

#### `esprima` ^4.0.1 + `escodegen` ^2.0.0 in `@nlpjs-neo/evaluator`

`esprima` 4.0.1 is from July 2018 and does not parse optional chaining, nullish coalescing,
numeric separators, or anything later. `escodegen` 2.1.0 (June 2023) is only lightly
maintained.

Both produce and consume ESTree, and `Evaluator` only walks a subset of ESTree node types,
so the replacement is mechanical:

- `acorn` 8.18.0 (July 2026, zero dependencies) for `parse(str)`. Pass
  `{ ecmaVersion: 'latest' }`.
- `astring` 1.9.0 (August 2024, zero dependencies) for `generate(node)`, which is the
  drop-in for `unparse(node)` in `evaluator.ts:244` and `javascript-compiler.ts:279`.

`meriyah` 7.3.3 is a faster parser with the same output if parse speed becomes a concern;
`acorn` is the safer default because of its ecosystem.

#### `kuromoji` ^0.1.2 in `@nlpjs-neo/lang-ja`

Last release March 2018, callback-only API, and `stemmer-ja.ts` locates the bundled
dictionary by probing three hard-coded `node_modules` paths, which is fragile under pnpm's
layout.

`@patdx/kuromoji` 1.0.4 (November 2024) is a typed, zero-dependency fork with the same
tokenizer output and a promise-based builder. Combine it with `import.meta.resolve` or
`createRequire(import.meta.url).resolve('@patdx/kuromoji/package.json')` to find the
dictionary directory instead of walking `../../../../node_modules`. `kuromojin` 3.0.1 is a
thin wrapper over the original and does not solve the dictionary problem.

### 3. Node built-ins that replace a dependency

The engine floor is Node 22.12, which makes these removals safe today.

| Dependency | Package | Built-in replacement | Since |
| --- | --- | --- | --- |
| `node-fetch` 2.6.7 | directline-connector | global `fetch` | Node 18 |
| `rimraf` 3.0.2 | fullbot | `fs.rmSync(dir, { recursive: true, force: true })` | Node 14.14 |
| `axios` 0.26.1 | request-rn | global `fetch` (see item 2 above) | Node 18 |
| `dotenv` (examples only) | examples/16 | `node --env-file=.env` or `process.loadEnvFile()` | Node 20.12 |

`directline-controller.ts` calls `fetch(url, { method, body, headers })` twice; the global
has the same signature, so the change was deleting the import and the dependency. Done.

`fullbot/src/utils.ts` used `rimraf.sync(dirPath)`; `fs.rmSync` with `recursive` and
`force` has identical semantics for a directory that may not exist. Done.

The `dotenv` row is the only one of the four still open; it is in `examples/`, which is
outside the workspace.

#### Proxy agents: native later, upgrade now

`https-proxy-agent` and `http-proxy-agent` are at 5.0.x in `request` and `utils` (and
`https-proxy-agent` is also declared, unused, in the root `devDependencies`). Latest is
9.1.0 (June 2026, Node 20 floor). The 6+ line exports classes instead of factory functions:

```ts
import { HttpsProxyAgent } from 'https-proxy-agent';
options.agent = new HttpsProxyAgent(proxyServer);
```

The upgrade to `^9.1.0` has landed, along with the removal of the root
`devDependencies` entry. One caller-visible edge: 6+ parses the proxy with `new URL`, so a
proxy configured as a bare `host:port` no longer works and needs a scheme.

Node 24.0.0 added `NODE_USE_ENV_PROXY=1` and the `--use-env-proxy` flag, which make
`http`, `https` and `fetch` honour `HTTP_PROXY`, `HTTPS_PROXY` and `NO_PROXY` without any
package. It is marked "active development" and is not in Node 22, so it cannot replace the
agents while the floor is 22.12. Upgrade to `^9.1.0` now; when the floor moves to 24, delete
both dependencies and the manual `process.env.https_proxy` lookup in `request.ts` and
`downloader.ts`, and document the environment variable instead. Remove the root
`devDependencies` entry in either case.

#### Legacy Node APIs used alongside these dependencies

Not dependencies, but the same three files use APIs that Node has deprecated and that the
replacements above make easy to retire at the same time:

- `url.parse()` in `request.ts`, `downloader.ts` and `builtin-duckling.ts`. It is deprecated
  (DEP0169) for security reasons; use `new URL(str)`. Properties map one to one:
  `hostname`, `port`, `pathname`, and `path` becomes `pathname + search`.
- `querystring.stringify()` in `request.ts` and `builtin-duckling.ts`; use
  `new URLSearchParams(obj).toString()`.

Also, `request.ts` sets the content type to `application/x-wwww-form-urlencoded` (four
`w`s). That typo predates this audit but is worth fixing in the same change.

### 4. Outdated: upgrade

#### `mongodb` ^3.5.9 (resolved 3.7.4) in `@nlpjs-neo/mongodb-adapter`

Latest is 7.6.0 (August 2026, Node 20.19 floor). Every major since 4 was breaking and the
adapter uses three things that no longer exist:

- `useNewUrlParser` and `useUnifiedTopology` options (removed in 4, ignored with a warning
  until then). Delete them.
- Callback-style `client.connect(cb)` (removed in 5). Use `await this.mongoClient.connect()`.
- `insertOne` returning `result.ops[0]` (`mongodb-adapter.ts:200`, removed in 4). Use
  `result.insertedId` and merge it into the input document.

Everything else the adapter calls (`find`, `findOne`, `insertMany`, `updateOne`,
`deleteOne`, `deleteMany`, `ObjectId`) is unchanged. The test's `collection-mock.ts` imports
types from `mongodb` and needs the same bump.

#### `compromise` ^13.7.0, `compromise-numbers` ^1.0.0, `compromise-dates` ^1.2.0

`compromise` 14.17.0 (September 2026) is ESM-native. In 14 the numbers plugin was merged
into core, so `compromise-numbers` (last release June 2021) is deleted rather than upgraded.
`compromise-dates` 3.9.0 (September 2026) declares a peer of `compromise >=14.2.0`.
`builtin-compromise.ts` can then drop the three `typeof x.default === 'function'` shims and
call `nlp.extend(dates)` only.

#### `pino` ^7.6.1 and `pino-pretty` ^7.2.0 in `@nlpjs-neo/logger`

Latest are `pino` 10.3.1 (February 2026) and `pino-pretty` 13.1.3 (December 2025). The
constructor currently passes `prettyPrint` and `colorize`. `prettyPrint` was deprecated in
7 and removed in 8, and `colorize` was never a `pino` option. Replace with a transport:

```ts
this.logger = pino(
  process.env.NODE_ENV === 'production'
    ? {}
    : { transport: { target: 'pino-pretty', options: { colorize: true } } }
);
```

`pino-pretty` then becomes an optional peer or a plain dependency depending on whether
production installs should carry it.

#### `express` ^4.17.1 (resolved 4.22.3) and `cors` in `@nlpjs-neo/express-api-server`

Express 5.2.1 (December 2025) is current; Express 4 still receives security patches, so this
is medium priority. One line needs checking: `express-api-app.ts:75` reads
`router.stack.map((layer) => layer.route.path)` for a debug log, which relies on router
internals. Express 5 uses `router` 2, where `stack` and `layer.route` still exist, but
confirm it in the test. No routes in the repo use `*`, `?` or regex segments, so the
path-to-regexp 8 syntax change does not affect them. `cors` 2.8.6 is the latest release.

#### `formidable` ^2.0.1 in `@nlpjs-neo/directline-connector`

Done. 3.5.4 (April 2025) is ESM-first and the `formidable({ ... })` factory is unchanged.
`form.parse` gains a promise form, which let the upload handler drop its callback, and
every field is now an array.

What the audit missed: the upload route was already broken under the declared version 2.
It read `files.activity.path`, but formidable renamed that property to `filepath` in 2, so
every upload threw. The route had no test; it has one now.

#### `archiver` ^5.2.0 in `@nlpjs-neo/fullbot`

8.0.0 (May 2026, Node 18 floor). Done, and this paragraph was wrong when written:
`.directory()`, `.pipe()` and `.finalize()` are unchanged, but 8 removed the
`archiver(format)` factory, so `compressFolder` builds `new ZipArchive()`. The package
ships no types either, so `@types/archiver` is a dev dependency of `fullbot`.

#### `bcryptjs` ^2.4.3 in `@nlpjs-neo/api-auth-jwt`

3.0.3 (November 2025) ships its own types and ESM entry; the `hashSync` and `compare` calls
are unchanged. The native alternative is `crypto.scrypt` from `node:crypto`, which needs no
dependency and is the recommendation of the Node documentation for password hashing. Moving
to scrypt changes the stored hash format, so existing user records would need to be
re-hashed on next login. Upgrade to 3 now; adopt scrypt if the package ever changes its
storage format anyway.

#### `passport` ^0.6.0, `passport-jwt` ^4.0.0, `passport-local` ^1.0.0, `jsonwebtoken` ^9.0.0

`passport` 0.7.0 (November 2023) is a small bump. `passport-local` 1.0.0 dates from 2014
and `passport-jwt` 4.0.1 from 2022; both are stable and have nothing to upgrade to.
`jsonwebtoken` 9.0.3 is the latest release.

Worth considering rather than required: the package registers exactly two strategies in
about 60 lines, and both are a database lookup plus one check. Two Express middlewares on
top of `jose` 6.2.12 (ESM, zero dependencies, Web Crypto, September 2026) would replace all
four packages with one. That is a design choice for the maintainers, not a defect.

#### `@microsoft/recognizers-text-suite` 1.3.0 in `@nlpjs-neo/builtin-microsoft`

Pinned exactly; 1.3.1 (July 2023) is the latest. The project is slow-moving but Microsoft
maintained, and there is no equivalent multi-locale recognizer set. Change the range to
`^1.3.1`.

#### `exceljs` ^4.1.1 in `@nlpjs-neo/utils`

4.4.0 (October 2023) is the latest. It is used only by `NlpAnalyzer` to write a workbook. Its
transitive chain (`unzipper` 0.10, `fstream`, `rimraf` 2) is deprecated. Once `xtables` moves
to `@office-kit/xlsx`, which writes as well as reads, `NlpAnalyzer` should move too so that the
workspace has one spreadsheet library.

#### `supertest` ^6 (root dev and `express-api-server` dev)

7.2.2 (January 2026). It is declared at both the root and package level; only the package
uses it, so keep the package-level entry at `^7.2.2` and remove the root one.

### 5. Kept as is

| Dependency | Package | Latest | Note |
| --- | --- | --- | --- |
| `botbuilder` 4.23.3 | msbf-connector | 4.23.3 | Current; remains after `fb-connector` drops it |
| `cors` 2.8.6 | express-api-server | 2.8.6 | Current |
| `jsonwebtoken` 9.0.3 | api-auth-jwt | 9.0.3 | Current |
| `@types/node` 22.x | root dev | 26.6.2 | Intentionally tracks the engine floor |
| `passport-jwt` 4.0.1, `passport-local` 1.0.0 | api-auth-jwt | same | No newer release; see the `jose` note |
| toolchain (`typescript`, `vitest`, `oxlint`, `oxfmt`, `@changesets/cli`, `publint`, `@arethetypeswrong/cli`) | root dev | latest | Current |

### 6. `examples/` (outside the workspace)

These do not affect the published packages but are what new users copy.

- `07-nlpjs-on-aws-lambda`: `aws-sdk` 2 reached end of support in September 2025; the
  example should use `@aws-sdk/client-*` v3 or, since it only needs Lambda's handler
  signature, no AWS package at all. It also depends on `node-nlp` 4.x rather than
  `node-nlp-neo`.
- `hello_world` inside `examples/`: `axios` 0.21 (same advisories as above) and `mocha`/`chai`
  where the rest of the repository uses `vitest`.
- `16-fb-connector`: `dotenv` can be replaced by `node --env-file=.env index.js`.

## Suggested order of work

1. **[x] One security PR, no API changes:** `tar` to 7.5, `archiver` to 8, `formidable` to 3,
   `https-proxy-agent`/`http-proxy-agent` to 9, `supertest` to 7, `bcryptjs` to 3,
   `passport` to 0.7, `@microsoft/recognizers-text-suite` to `^1.3.1`; remove `coveralls`
   and the root `https-proxy-agent` and `supertest` entries; add the `tar` override. This
   clears the 13 `tar` advisories and six of the seven from the `coveralls` chain.
2. **[x] Built-in replacements:** delete `node-fetch`, `rimraf`, `axios`; migrate `url.parse`
   and `querystring` in the same files. Clears the 23 `axios` advisories.
3. **[x] `decompress` to `node-stream-zip`** in `fullbot`. Clears the last unfixed critical.
4. **[ ] `pino` 10, `compromise` 14, `mongodb` 7, `esprima`/`escodegen` to `acorn`/`astring`.**
   Each is a contained change to one package with its own tests.
5. **[ ] `xlsx` to `@office-kit/xlsx`** per the existing plan, then `exceljs` onto the same library.
6. **[ ] Connector clean-up:** rewrite `fb-connector` on `fetch`, replace `serverless-express`
   with `@codegenie/serverless-express` 4.17, decide the future of `dialogflow-connector`.
7. **[ ] `open-question` to `@huggingface/transformers`.** Largest item; bump `tfjs-node` to
   `^4.22` first if it has to wait.
8. **[ ] When the floor moves to Node 24:** drop the proxy agents in favour of
   `NODE_USE_ENV_PROXY`, and move `@codegenie/serverless-express` to 5.

## Progress log

### 2026-09-20 — coverage for everything steps 1 to 3 touch

None of the code behind these dependencies had integration coverage, so it was written
first, against the dependencies as they were still declared. New suites:
`utils/test/downloader.test.ts` (rewritten), `request/test/request.test.ts`,
`request-rn/test/request.test.ts`, `fullbot/test/utils.test.ts`,
`builtin-duckling/test/duckling-request.test.ts`,
`directline-connector/test/directline-controller.test.ts` and
`directline-connector/test/directline-connector.test.ts`. They all drive a real local HTTP
server and real archives rather than mocks, and each clears the ambient proxy environment
variables so it behaves the same behind a corporate proxy.

### 2026-09-20 — step 1, the upgrades with no API change

Items 1, 4, 16, 20, 21, 22, 23 and 24. Two corrections to what this document assumed:

- **Item 20 was not a no-op.** `archiver` 8 removed the `archiver(format)` factory
  entirely; the call site now builds a `ZipArchive`. The package also ships no types, so
  `@types/archiver` was added.
- **Item 16 has a caller-visible edge.** `https-proxy-agent` 6+ parses the proxy with
  `new URL`, so a bare `host:port` no longer works; a proxy setting must carry a scheme.

### 2026-09-20 — step 2, the built-in replacements

Items 2, 7 and 8, plus the `url.parse` and `querystring` clean-up and the
`application/x-wwww-form-urlencoded` typo called out in section 3.

`@nlpjs-neo/request-rn` keeps the axios-shaped options (`data`, `params`, `headers`) and
the rejection on an error status, rather than the narrower shape sketched in item 2, so
callers do not have to change. An error is now a plain `Error` carrying `status` and
`data`.

Two bugs surfaced while migrating and were fixed in the same change: `Content-Length` was
computed with `String.length` in both `request.ts` and `builtin-duckling.ts`, which
truncates a body containing non-ASCII characters, and a url-encoded body now encodes a
space as `+` rather than `%20`.

### 2026-09-20 — step 3, `decompress` to `node-stream-zip`

Item 3. Beyond the zip-slip fix, `restore` now rejects on an archive it cannot read.
`decompress` resolved with an empty list instead, which meant `mount` treated a corrupt
download as a success and left the bot folder empty after clearing it; the rollback to the
backup never ran. Both the zip-slip guard and the rollback have tests.

### 2026-09-20 — item 19, `formidable`

Writing the missing coverage showed that
`POST /directline/conversations/:conversationId/upload` could not have worked under the
declared `formidable` 2: the handler read `files.activity.path`, which formidable renamed
to `filepath` in version 2. The upgrade to 3 repairs the route (fields are arrays,
`form.parse` resolves instead of taking a callback), creates the upload folder if it is
missing, removes temporary files on the error path as well, and answers 500 instead of
throwing for a malformed upload.

### Remaining advisories

The 6 that are left all belong to items still open:

| Package | Path | Item |
| --- | --- | --- |
| `xlsx` (2 high) | `xtables > xlsx` | 5 |
| `adm-zip` (2 high, 1 moderate) | `open-question > @tensorflow/tfjs-node > adm-zip` | 6 |
| `uuid` (1 moderate) | `dialogflow-connector > actions-on-google > ...`, `fb-connector > botbuilder > ...` | 9, 10 |
