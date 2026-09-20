---
'@nlpjs-neo/core-loader': major
---

Drop the plugin entries for the packages removed in the September 2026 package
cull.

Every package in `packages/` was measured against its weekly download count on
the pre-fork `@nlpjs` namespace, since `@nlpjs-neo` is not published yet and so
carries no signal of its own. The 25 packages under 200 weekly downloads had no
dependents among the packages that stayed, so they came out together, and these
13 names no longer resolve from a `conf.json`:

`ApiAuthJwt`, `Bot`, `BuiltinCompromise`, `Database`, `DirectlineConnector`,
`ExpressApiServer`, `ExpressApiServerless`, `FbConnector`, `Mongodb`,
`MongodbAdapter`, `MsbfConnector`, `NluLuis`, `Qna`.

A container that names any of them fails to load, so this is breaking for anyone
whose configuration used the bot, connector or API-server plugins.
`ConsoleConnector` is unaffected and remains the supported way to talk to a bot.
