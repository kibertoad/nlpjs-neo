# Dependency audit, September 2026

Status: in progress. Written 2026-09-20 against the `pnpm-lock.yaml` on `main`
(commit `7f49b81`), and kept up to date as the work lands. The Status column of the
recommendations table and the checklist under "Suggested order of work" are the record of
what is done; **Progress log** at the end of the document records each landed step,
including the places where the original finding turned out to be wrong.

Items 1 to 4, 7, 8, 12 to 16, 19 to 24 are done. `pnpm audit` is down from 51 advisories
(3 critical, 23 high, 24 moderate, 1 low) to 2 (2 high), both of which belong to item 5.
Step 4 moved no advisory, because none of the four dependencies it replaced carried one;
what it removed was unmaintained code and four defects that the packages' own tests were
hiding.

**Items 6, 9, 10, 11, 18, 21, 22, 23 and 25 are moot.** The September 2026 package cull
removed 25 packages that were under 200 weekly downloads on the pre-fork `@nlpjs`
namespace and had no remaining internal dependents, and those nine items all belonged to
packages it removed. That took `pnpm audit` from 6 advisories to 2 without any upgrade
work: the `adm-zip` advisories left with `@tensorflow/tfjs-node`, and the `uuid` one left
with `actions-on-google` and `botbuilder`. Their analysis is kept below for the record,
each marked **Moot**.

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
| 1 | `tar` 6.2.1 | utils (and 4.4.19 via tfjs-node) | 13 advisories, 1 critical, fixed only in 7.5.x | Upgrade to `^7.5.22`, add a pnpm override for the tfjs-node path | Done (package since removed) |
| 2 | `axios` 0.26.1 | request-rn | 23 advisories | Replace with global `fetch` | Done (package since removed) |
| 3 | `decompress` 4.2.1 | fullbot | Critical zip-slip, no fixed version, last release 2020 | Replace with `node-stream-zip` | Done (package since removed) |
| 4 | `coveralls` 3.1.1 | root dev | Unmaintained, pulls `request` 2.88 with 7 advisories, not used by CI | Remove | Done |
| 5 | `xlsx` 0.18.5 | xtables | Two unfixed CVEs on npm, no npm releases since 2022 | Follow `docs/migrate-sheetjs-to-office-kit.md` | Open |
| 6 | `@tensorflow/tfjs-node` 3.21.1 | open-question | Two majors behind, project in maintenance mode, drags in vulnerable `tar` 4, `adm-zip` 0.5, `rimraf` 2, `https-proxy-agent` 2 | Migrate to `@huggingface/transformers`; bump to `^4.22` as a stopgap | Moot — package removed |
| 7 | `node-fetch` 2.6.7 | directline-connector | Node has had `fetch` since 18 | Remove, use global `fetch` | Done (package since removed) |
| 8 | `rimraf` 3.0.2 | fullbot | Node has `fs.rmSync` since 14.14 | Remove, use `fs.rmSync` | Done (package since removed) |
| 9 | `actions-on-google` 3.0.0 | dialogflow-connector | Platform shut down June 2023, library archived | Retire the package or rewrite as a plain Dialogflow ES webhook | Moot — package removed |
| 10 | `botbuilder-adapter-facebook` 1.0.12 | fb-connector | Botkit adapter, last release 2022, pulls all of Botkit and Bot Framework | Replace with a small Graph API client on `fetch` | Moot — package removed |
| 11 | `serverless-express` 2.0.12 | express-api-serverless | Abandoned fork, last release 2021 | Replace with `@codegenie/serverless-express` | Moot — package removed |
| 12 | `esprima` 4.0.1 + `escodegen` 2.1.0 | evaluator | Parser frozen since 2018, no ES2020+ syntax | Replace with `acorn` + `astring` | Done |
| 13 | `mongodb` 3.7.4 | mongodb-adapter | Four majors behind, uses removed APIs | Upgrade to `^7.6.0` and update the adapter | Done (package since removed) |
| 14 | `compromise` 13 + `compromise-numbers` + `compromise-dates` 1 | builtin-compromise | One major behind, numbers plugin folded into core | Upgrade to `compromise` 14 + `compromise-dates` 3, drop `compromise-numbers` | Done (package since removed) |
| 15 | `pino` 7 + `pino-pretty` 7 | logger | Three and six majors behind, `prettyPrint` option no longer exists | Upgrade; `pino-pretty` as a stream, not a `transport` | Done |
| 16 | `https-proxy-agent` 5 + `http-proxy-agent` 5 | request, root dev (also utils, since removed) | Four majors behind; Node 24 has built-in env proxy support | Upgrade to `^9.1.0` now, drop once the floor is Node 24 | Done (upgraded; removal waits for Node 24) |
| 17 | `kuromoji` 0.1.2 | lang-ja | Last release 2018, callback API, dictionary path hand-resolved | Switch to `@patdx/kuromoji` | Open |
| 18 | `express` 4 | express-api-server | One major behind, still patched | Upgrade to 5 when convenient, one line to verify | Moot — package removed |
| 19 | `formidable` 2 | directline-connector | One major behind | Upgrade to `^3.5.4` | Done (package since removed) |
| 20 | `archiver` 5 | fullbot | Three majors behind | Upgrade to `^8.0.0` | Done (package since removed) |
| 21 | `bcryptjs` 2 | api-auth-jwt | One major behind; Node `crypto.scrypt` is native | Upgrade to 3, or move to `scrypt` | Moot — package removed |
| 22 | `supertest` 6 | root dev, express-api-server dev | One major behind, declared twice | Upgrade to 7, keep only the package-level declaration | Moot — package removed |
| 23 | `passport` 0.6 | api-auth-jwt | Minor behind; whole stack is optional for two strategies | Upgrade to 0.7, consider dropping passport | Moot — package removed |
| 24 | `@microsoft/recognizers-text-suite` 1.3.0 | builtin-microsoft | Pinned exactly, patch behind | Change to `^1.3.1` | Done |
| 25 | `exceljs` 4.4.0 | utils | Last release 2023, deprecated transitive chain | Consolidate onto `@office-kit/xlsx` after item 5 | Moot — package removed |

## Findings in detail

### 1. Security: fix now

#### `tar` ^6.0.2 (resolved 6.2.1) in `@nlpjs-neo/utils`

**Moot.** `@nlpjs-neo/utils` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

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

**Moot.** `@nlpjs-neo/request-rn` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

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

**Moot.** `@nlpjs-neo/fullbot` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

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

**Moot.** `@nlpjs-neo/open-question` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

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

**Moot.** `@nlpjs-neo/dialogflow-connector` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

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

**Moot.** `@nlpjs-neo/fb-connector` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

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

**Moot.** `@nlpjs-neo/express-api-serverless` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

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

Done. The acorn options live in one `parse` module that both files share rather than being
repeated at each call site. Two things the item did not mention:

- A mechanical swap on its own changes nothing a caller can see, because the walkers
  interpret a fixed set of ESTree node types and had no case for the syntax the new parser
  unlocks. They now handle `??`, with its short circuit, and optional chaining for member,
  computed and call links. Only a link carrying `?.` short-circuits, so `a?.b.c` still
  throws on the plain `.c` when `a` is missing; the suite states that as a limitation.
- The wording of a parse error is caller-visible. `acorn` says `Unexpected token (1:6)`
  where `esprima` said `Line 1: Unexpected token ^`. Two tests asserted the old message
  verbatim, one of them a copy in `node-nlp`, and now assert the error type and that a
  position is reported.

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

**Moot.** `@nlpjs-neo/mongodb-adapter` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

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

Done, and the paragraph above was wrong twice. Callbacks were not removed from `connect`
alone: driver 5 removed them from every operation, so `find`, `findOne`, `insertOne`,
`insertMany`, `updateOne`, `deleteOne` and `deleteMany` all had to be rewritten, and
`executeInCollection` became a plain async call instead of a callback wrapped in a promise.
And `collection-mock.ts` did not need a bump, it needed deleting: it and `mongodb-mock.ts`
were hand-written imitations of the driver 3 callback API, which is the thing being
replaced, and they were wrong about what the driver returns. See the progress log for the
four defects they were hiding.

#### `compromise` ^13.7.0, `compromise-numbers` ^1.0.0, `compromise-dates` ^1.2.0

**Moot.** `@nlpjs-neo/builtin-compromise` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

`compromise` 14.17.0 (September 2026) is ESM-native. In 14 the numbers plugin was merged
into core, so `compromise-numbers` (last release June 2021) is deleted rather than upgraded.
`compromise-dates` 3.9.0 (September 2026) declares a peer of `compromise >=14.2.0`.
`builtin-compromise.ts` can then drop the three `typeof x.default === 'function'` shims and
call `nlp.extend(dates)` only.

Done, and this is more than an upgrade with a plugin removal: two shapes the entity
handlers read moved.

- `compromise-dates` 3 reports the resolved range under `dates`, where version 1 used
  `date`. Every date entity resolved to the empty string until this was mapped.
- `compromise` 14 reports a number as `number.num` and no longer supplies the `cardinal`,
  `ordinal` and `textOrdinal` spellings the plugin added, all three of which the number
  handler read. An ordinal is now recognised from the `Ordinal` tag on its terms, which
  avoids parsing the matched text a second time, and the `2nd`-style resolution value is
  formatted from the number.

The entities the package emits are unchanged.

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

Done, with one deviation and one correction.

The deviation: `pino-pretty` is wired up as a destination stream, not as a `transport`. A
transport runs in a worker thread, and this package builds its logger at module scope, so a
transport would leak a thread into every process that imports `@nlpjs-neo/logger` and lose
records unless every caller flushed on exit. A stream keeps the logging synchronous and
thread-free.

The correction: `pino` 10 does not ignore `prettyPrint`, it throws on it. Because the
logger is built at module scope, importing `@nlpjs-neo/logger` -- or `@nlpjs-neo/basic`,
which re-exports it -- would have thrown on load. This was the highest-severity item in
step 4 and the audit had it as a medium-priority upgrade.

`pino-pretty` stays a plain dependency, as it already was. `Logger` also takes an optional
destination stream now and is exported beside the singleton, which is what let the suite
assert what is written rather than that a method was called.

#### `express` ^4.17.1 (resolved 4.22.3) and `cors` in `@nlpjs-neo/express-api-server`

**Moot.** `@nlpjs-neo/express-api-server` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

Express 5.2.1 (December 2025) is current; Express 4 still receives security patches, so this
is medium priority. One line needs checking: `express-api-app.ts:75` reads
`router.stack.map((layer) => layer.route.path)` for a debug log, which relies on router
internals. Express 5 uses `router` 2, where `stack` and `layer.route` still exist, but
confirm it in the test. No routes in the repo use `*`, `?` or regex segments, so the
path-to-regexp 8 syntax change does not affect them. `cors` 2.8.6 is the latest release.

#### `formidable` ^2.0.1 in `@nlpjs-neo/directline-connector`

**Moot.** `@nlpjs-neo/directline-connector` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

Done. 3.5.4 (April 2025) is ESM-first and the `formidable({ ... })` factory is unchanged.
`form.parse` gains a promise form, which let the upload handler drop its callback, and
every field is now an array.

What the audit missed: the upload route was already broken under the declared version 2.
It read `files.activity.path`, but formidable renamed that property to `filepath` in 2, so
every upload threw. The route had no test; it has one now.

#### `archiver` ^5.2.0 in `@nlpjs-neo/fullbot`

**Moot.** `@nlpjs-neo/fullbot` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

8.0.0 (May 2026, Node 18 floor). Done, and this paragraph was wrong when written:
`.directory()`, `.pipe()` and `.finalize()` are unchanged, but 8 removed the
`archiver(format)` factory, so `compressFolder` builds `new ZipArchive()`. The package
ships no types either, so `@types/archiver` is a dev dependency of `fullbot`.

#### `bcryptjs` ^2.4.3 in `@nlpjs-neo/api-auth-jwt`

**Moot.** `@nlpjs-neo/api-auth-jwt` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

3.0.3 (November 2025) ships its own types and ESM entry; the `hashSync` and `compare` calls
are unchanged. The native alternative is `crypto.scrypt` from `node:crypto`, which needs no
dependency and is the recommendation of the Node documentation for password hashing. Moving
to scrypt changes the stored hash format, so existing user records would need to be
re-hashed on next login. Upgrade to 3 now; adopt scrypt if the package ever changes its
storage format anyway.

#### `passport` ^0.6.0, `passport-jwt` ^4.0.0, `passport-local` ^1.0.0, `jsonwebtoken` ^9.0.0

**Moot.** `@nlpjs-neo/api-auth-jwt` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

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

**Moot.** `@nlpjs-neo/utils` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

4.4.0 (October 2023) is the latest. It is used only by `NlpAnalyzer` to write a workbook. Its
transitive chain (`unzipper` 0.10, `fstream`, `rimraf` 2) is deprecated. Once `xtables` moves
to `@office-kit/xlsx`, which writes as well as reads, `NlpAnalyzer` should move too so that the
workspace has one spreadsheet library.

#### `supertest` ^6 (root dev and `express-api-server` dev)

**Moot.** `@nlpjs-neo/express-api-server` was removed from the workspace in the September 2026 package cull, so this item no longer has a package to apply to. The analysis is kept for the record.

7.2.2 (January 2026). It is declared at both the root and package level; only the package
uses it, so keep the package-level entry at `^7.2.2` and remove the root one.

### 5. Kept as is

| Dependency | Package | Latest | Note |
| --- | --- | --- | --- |
| `@types/node` 22.x | root dev | 26.6.2 | Intentionally tracks the engine floor |
| toolchain (`typescript`, `vitest`, `oxlint`, `oxfmt`, `@changesets/cli`, `publint`, `@arethetypeswrong/cli`) | root dev | latest | Current |

`botbuilder`, `cors`, `jsonwebtoken`, `passport-jwt` and `passport-local` were also on this
list. All five belonged to packages the September 2026 cull removed, and none of them is
declared anywhere in the workspace now.

### 6. `examples/` (outside the workspace)

These do not affect the published packages but are what new users copy.

- `07-nlpjs-on-aws-lambda`: `aws-sdk` 2 reached end of support in September 2025; the
  example should use `@aws-sdk/client-*` v3 or, since it only needs Lambda's handler
  signature, no AWS package at all. It also depends on `node-nlp` 4.x rather than
  `node-nlp-neo`.
- `hello_world` inside `examples/`: `axios` 0.21 (same advisories as above) and `mocha`/`chai`
  where the rest of the repository uses `vitest`.

## Suggested order of work

1. **[x] One security PR, no API changes:** `tar` to 7.5, `archiver` to 8, `formidable` to 3,
   `https-proxy-agent`/`http-proxy-agent` to 9, `supertest` to 7, `bcryptjs` to 3,
   `passport` to 0.7, `@microsoft/recognizers-text-suite` to `^1.3.1`; remove `coveralls`
   and the root `https-proxy-agent` and `supertest` entries; add the `tar` override. This
   clears the 13 `tar` advisories and six of the seven from the `coveralls` chain.
2. **[x] Built-in replacements:** delete `node-fetch`, `rimraf`, `axios`; migrate `url.parse`
   and `querystring` in the same files. Clears the 23 `axios` advisories.
3. **[x] `decompress` to `node-stream-zip`** in `fullbot`. Clears the last unfixed critical.
4. **[x] `pino` 10, `compromise` 14, `mongodb` 7, `esprima`/`escodegen` to `acorn`/`astring`.**
   Each is a contained change to one package with its own tests.
5. **[ ] `xlsx` to `@office-kit/xlsx`** per the existing plan. The `exceljs` half of this
   item went away with `utils`.
6. **[x] Connector clean-up.** Settled by removal rather than by rewriting: `fb-connector`,
   `dialogflow-connector` and `express-api-serverless` are gone.
7. **[x] `open-question` to `@huggingface/transformers`.** Settled by removal; the package
   and its `tfjs-node` dependency are gone.
8. **[ ] When the floor moves to Node 24:** drop the proxy agents in favour of
   `NODE_USE_ENV_PROXY`.

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

### 2026-09-20 — coverage for step 4

Same order as before: the coverage went in first, against the four dependencies as they were
still declared, and it is what turned up most of what follows.

- `logger`: the suite spied on `logger.logger[level]` and asserted the spy was called, which
  would pass against a `pino` that emitted nothing. `Logger` now takes an optional
  destination stream, and the tests read the records back: level numbers, level filtering,
  `log` mapping to info, merged objects, error serialization, format-string interpolation,
  and the formatted line `pino-pretty` produces. Two construction tests cover the
  development and production branches.
- `evaluator`: the existing suites covered the walkers thoroughly but never stated what the
  package needs from the parser and the generator. A new suite runs the literal kinds,
  precedence, member and computed access, several statements, an empty source and invalid
  syntax through both `Evaluator` and `JavascriptCompiler`, plus the one path that reaches
  the code generator, a `FunctionExpression` compiled with `Function`.
- `builtin-compromise`: the suite drove real `compromise` for every entity kind but stopped
  at a single match. Added: the `entity_0`/`entity_1` numbering for a repeated kind,
  `extract` appending to edges the input already carries and preferring `text` over
  `utterance`, the `catch` path, and `run`, which had no test at all.
- `mongodb-adapter`: replaced the hand-written callback mocks with a real `mongod` from
  `mongodb-memory-server`, driving the adapter's public API against it. CI caches the
  downloaded binary, with `MONGOMS_DOWNLOAD_DIR` pinning where it lands: left to itself
  `mongodb-memory-server` picks `node_modules/.cache` or the home cache depending on how it
  was installed, and the first version of the cache step guessed the wrong one and silently
  cached nothing.

### 2026-09-20 — step 4, the four contained upgrades

Items 12, 13, 14 and 15. The audit called these "a contained change to one package with its
own tests". The changes were contained; the tests were not as good as the sentence assumed,
and six defects came out of writing them, five of them in `mongodb-adapter`:

- **`insertMany` never returned the inserted documents.** It answered with the driver's own
  result, counts and ids, so no caller could read back what it stored. `CollectionMock`
  called back with the items, so the test passed.
- **`save` on an existing item returned the raw `updateOne` result**, which carries no
  document. Same cause: `CollectionMock.updateOne` called back with the item.
- **`convertOut` turned a document that was not found into an empty object**, which reads as
  a hit to every caller. This also broke `save`: an item carrying a well formed id that
  nothing was stored under took the update path and silently stored nothing. Only the
  existing test's invalid id (`'patata'`) kept that path from being exercised.
- **`convertIn` converted the elements of an array with `convertOut`**, so an explicit `id`
  on a bulk insert was dropped and replaced by a generated one.
- **`connect` read `this.dbName`, which is never assigned**, so the database always came from
  the connection string and `settings.dbName` was ignored. Deriving `settings.dbName` from
  the url also took any query string with it.
- **Every date entity from `builtin-compromise` would have resolved to the empty string**
  after the upgrade, because `compromise-dates` 3 moved the range from `date` to `dates`.

Two further notes:

- `pino` 10 throws on the removed `prettyPrint` option rather than ignoring it, and the
  logger is built at module scope, so this item was an import-time crash waiting for the
  upgrade, not the medium-priority tidy-up the table implied.
- Replacing `esprima` with `acorn` changes the wording of a parse error, which two tests
  asserted verbatim.

The audit's own framing was wrong in one place worth recording: item 13 listed three removed
APIs to deal with, but driver 5 removed callbacks from every operation, not from `connect`
alone, so the whole adapter had to be rewritten rather than patched in three places.

### Remaining advisories

The 2 that are left both belong to item 5, which is still open:

| Package | Path | Item |
| --- | --- | --- |
| `xlsx` (2 high) | `xtables > xlsx` | 5 |

The other four went away with the package cull rather than with an upgrade: `adm-zip`
(2 high, 1 moderate) came in through `open-question > @tensorflow/tfjs-node`, and `uuid`
(1 moderate) through `dialogflow-connector > actions-on-google` and
`fb-connector > botbuilder`.

### 2026-09-20 — package cull, 25 packages removed

Every package in `packages/` was checked against its weekly download count on the pre-fork
`@nlpjs` namespace (the `@nlpjs-neo` namespace is not published yet, so it carries no
signal). The 25 under 200 weekly downloads turned out to have no dependents among the
packages that stayed, so they came out as one closed cluster with no code changes needed
anywhere else:

`api-auth-jwt`, `bert-open-question`, `bert-tokenizer`, `bot`, `builtin-compromise`,
`database`, `dialogflow-connector`, `directline-connector`, `express-api-server`,
`express-api-serverless`, `fb-connector`, `fullbot`, `lang-bert`, `lexer`,
`mongodb-adapter`, `msbf-connector`, `neural-worker`, `nlu-luis`, `open-question`,
`python-compiler`, `qna-importer`, `request-rn`, `rest-connector`, `similarity-wa`,
`utils`.

What this removed beyond the nine audit items above: `express` and `cors` are no longer in
the workspace at all, which retires the question of migrating the API server to Fastify or
Hono; the `tar` pnpm override and all four `allowBuilds` entries are gone, since nothing
left runs an install script; and the mongod download and cache steps came out of CI.
`api-auth-jwt` is worth calling out separately, because it was removed on its merits rather
than on its download count: its duplicate-user check queried a `mail` field against records
written with `email`, its refresh-token rotation deleted the key `"[object Object]"` instead
of the old token, and it fell back to a signing secret published in the package when
`JWT_SECRET` was unset.
