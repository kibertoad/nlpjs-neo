---
'@nlpjs-neo/api-auth-jwt': minor
'@nlpjs-neo/basic': minor
'@nlpjs-neo/bert-open-question': minor
'@nlpjs-neo/bert-tokenizer': minor
'@nlpjs-neo/bot': minor
'@nlpjs-neo/builtin-compromise': minor
'@nlpjs-neo/builtin-default': minor
'@nlpjs-neo/builtin-duckling': minor
'@nlpjs-neo/builtin-microsoft': minor
'@nlpjs-neo/connector': minor
'@nlpjs-neo/console-connector': minor
'@nlpjs-neo/core': minor
'@nlpjs-neo/core-loader': minor
'@nlpjs-neo/database': minor
'@nlpjs-neo/dialogflow-connector': minor
'@nlpjs-neo/directline-connector': minor
'@nlpjs-neo/emoji': minor
'@nlpjs-neo/evaluator': minor
'@nlpjs-neo/express-api-server': minor
'@nlpjs-neo/express-api-serverless': minor
'@nlpjs-neo/fb-connector': minor
'@nlpjs-neo/fullbot': minor
'@nlpjs-neo/lang-all': minor
'@nlpjs-neo/lang-ar': minor
'@nlpjs-neo/lang-bert': minor
'@nlpjs-neo/lang-bn': minor
'@nlpjs-neo/lang-ca': minor
'@nlpjs-neo/lang-cs': minor
'@nlpjs-neo/lang-da': minor
'@nlpjs-neo/lang-de': minor
'@nlpjs-neo/lang-el': minor
'@nlpjs-neo/lang-en': minor
'@nlpjs-neo/lang-en-min': minor
'@nlpjs-neo/lang-es': minor
'@nlpjs-neo/lang-eu': minor
'@nlpjs-neo/lang-fa': minor
'@nlpjs-neo/lang-fi': minor
'@nlpjs-neo/lang-fr': minor
'@nlpjs-neo/lang-ga': minor
'@nlpjs-neo/lang-gl': minor
'@nlpjs-neo/lang-hi': minor
'@nlpjs-neo/lang-hu': minor
'@nlpjs-neo/lang-hy': minor
'@nlpjs-neo/lang-id': minor
'@nlpjs-neo/lang-it': minor
'@nlpjs-neo/lang-ja': minor
'@nlpjs-neo/lang-ko': minor
'@nlpjs-neo/lang-lt': minor
'@nlpjs-neo/lang-ms': minor
'@nlpjs-neo/lang-ne': minor
'@nlpjs-neo/lang-nl': minor
'@nlpjs-neo/lang-no': minor
'@nlpjs-neo/lang-pl': minor
'@nlpjs-neo/lang-pt': minor
'@nlpjs-neo/lang-ro': minor
'@nlpjs-neo/lang-ru': minor
'@nlpjs-neo/lang-sl': minor
'@nlpjs-neo/lang-sr': minor
'@nlpjs-neo/lang-sv': minor
'@nlpjs-neo/lang-ta': minor
'@nlpjs-neo/lang-th': minor
'@nlpjs-neo/lang-tl': minor
'@nlpjs-neo/lang-tr': minor
'@nlpjs-neo/lang-uk': minor
'@nlpjs-neo/lang-zh': minor
'@nlpjs-neo/language': minor
'@nlpjs-neo/language-min': minor
'@nlpjs-neo/lexer': minor
'@nlpjs-neo/logger': minor
'@nlpjs-neo/mongodb-adapter': minor
'@nlpjs-neo/msbf-connector': minor
'@nlpjs-neo/ner': minor
'@nlpjs-neo/neural': minor
'@nlpjs-neo/neural-worker': minor
'@nlpjs-neo/nlg': minor
'@nlpjs-neo/nlp': minor
'@nlpjs-neo/nlu': minor
'@nlpjs-neo/nlu-luis': minor
'@nlpjs-neo/open-question': minor
'@nlpjs-neo/python-compiler': minor
'@nlpjs-neo/qna-importer': minor
'@nlpjs-neo/request': minor
'@nlpjs-neo/request-rn': minor
'@nlpjs-neo/rest-connector': minor
'@nlpjs-neo/sentiment': minor
'@nlpjs-neo/similarity': minor
'@nlpjs-neo/similarity-wa': minor
'@nlpjs-neo/slot': minor
'@nlpjs-neo/utils': minor
'@nlpjs-neo/xtables': minor
'node-nlp-neo': minor
---

Migrate the sources to TypeScript and publish compiled ESM with bundled type
declarations.

Every package is now written in TypeScript, compiled with TypeScript 7 and published from
`dist/` as ES modules alongside `.d.ts`, `.d.ts.map` and `.js.map` files, so consumers get
types and working go-to-definition out of the box. The `exports` map gained a `types`
condition and the packages declare `files` so only the build output ships.

There is no CommonJS build, as before. The public API is unchanged, apart from three latent
bugs that the type checker surfaced: `BaseStemmer` now implements the `copy_from` that every
generated stemmer chains up to, `MemorydbAdapter.find` no longer misspells `conditionKeys.length`,
and `StemmerTl.removeInfix` no longer compares its loop condition against `0`.
