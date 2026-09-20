---
'@nlpjs-neo/api-auth-jwt': major
'@nlpjs-neo/basic': major
'@nlpjs-neo/bert-open-question': major
'@nlpjs-neo/bert-tokenizer': major
'@nlpjs-neo/bot': major
'@nlpjs-neo/builtin-compromise': major
'@nlpjs-neo/builtin-default': major
'@nlpjs-neo/builtin-duckling': major
'@nlpjs-neo/builtin-microsoft': major
'@nlpjs-neo/connector': major
'@nlpjs-neo/console-connector': major
'@nlpjs-neo/core-loader': major
'@nlpjs-neo/core': major
'@nlpjs-neo/database': major
'@nlpjs-neo/dialogflow-connector': major
'@nlpjs-neo/directline-connector': major
'@nlpjs-neo/emoji': major
'@nlpjs-neo/evaluator': major
'@nlpjs-neo/express-api-server': major
'@nlpjs-neo/express-api-serverless': major
'@nlpjs-neo/fb-connector': major
'@nlpjs-neo/fullbot': major
'@nlpjs-neo/lang-all': major
'@nlpjs-neo/lang-ar': major
'@nlpjs-neo/lang-bert': major
'@nlpjs-neo/lang-bn': major
'@nlpjs-neo/lang-ca': major
'@nlpjs-neo/lang-cs': major
'@nlpjs-neo/lang-da': major
'@nlpjs-neo/lang-de': major
'@nlpjs-neo/lang-el': major
'@nlpjs-neo/lang-en-min': major
'@nlpjs-neo/lang-en': major
'@nlpjs-neo/lang-es': major
'@nlpjs-neo/lang-eu': major
'@nlpjs-neo/lang-fa': major
'@nlpjs-neo/lang-fi': major
'@nlpjs-neo/lang-fr': major
'@nlpjs-neo/lang-ga': major
'@nlpjs-neo/lang-gl': major
'@nlpjs-neo/lang-hi': major
'@nlpjs-neo/lang-hu': major
'@nlpjs-neo/lang-hy': major
'@nlpjs-neo/lang-id': major
'@nlpjs-neo/lang-it': major
'@nlpjs-neo/lang-ja': major
'@nlpjs-neo/lang-ko': major
'@nlpjs-neo/lang-lt': major
'@nlpjs-neo/lang-ms': major
'@nlpjs-neo/lang-ne': major
'@nlpjs-neo/lang-nl': major
'@nlpjs-neo/lang-no': major
'@nlpjs-neo/lang-pl': major
'@nlpjs-neo/lang-pt': major
'@nlpjs-neo/lang-ro': major
'@nlpjs-neo/lang-ru': major
'@nlpjs-neo/lang-sl': major
'@nlpjs-neo/lang-sr': major
'@nlpjs-neo/lang-sv': major
'@nlpjs-neo/lang-ta': major
'@nlpjs-neo/lang-th': major
'@nlpjs-neo/lang-tl': major
'@nlpjs-neo/lang-tr': major
'@nlpjs-neo/lang-uk': major
'@nlpjs-neo/lang-zh': major
'@nlpjs-neo/language-min': major
'@nlpjs-neo/language': major
'@nlpjs-neo/lexer': major
'@nlpjs-neo/logger': major
'@nlpjs-neo/mongodb-adapter': major
'@nlpjs-neo/msbf-connector': major
'@nlpjs-neo/ner': major
'@nlpjs-neo/neural-worker': major
'@nlpjs-neo/neural': major
'@nlpjs-neo/nlg': major
'@nlpjs-neo/nlp': major
'@nlpjs-neo/nlu-luis': major
'@nlpjs-neo/nlu': major
'node-nlp-neo': major
'@nlpjs-neo/open-question': major
'@nlpjs-neo/python-compiler': major
'@nlpjs-neo/qna-importer': major
'@nlpjs-neo/request-rn': major
'@nlpjs-neo/request': major
'@nlpjs-neo/rest-connector': major
'@nlpjs-neo/sentiment': major
'@nlpjs-neo/similarity-wa': major
'@nlpjs-neo/similarity': major
'@nlpjs-neo/slot': major
'@nlpjs-neo/utils': major
'@nlpjs-neo/xtables': major
---

Convert every package to ESM only

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
