---
'@nlpjs-neo/builtin-default': minor
'@nlpjs-neo/builtin-duckling': minor
'@nlpjs-neo/builtin-microsoft': minor
'@nlpjs-neo/connector': minor
'@nlpjs-neo/console-connector': minor
'@nlpjs-neo/core': minor
'@nlpjs-neo/core-loader': minor
'@nlpjs-neo/emoji': minor
'@nlpjs-neo/evaluator': minor
'@nlpjs-neo/lang-all': minor
'@nlpjs-neo/lang-ar': minor
'@nlpjs-neo/lang-bn': minor
'@nlpjs-neo/lang-ca': minor
'@nlpjs-neo/lang-cs': minor
'@nlpjs-neo/lang-da': minor
'@nlpjs-neo/lang-de': minor
'@nlpjs-neo/lang-el': minor
'@nlpjs-neo/lang-en-min': minor
'@nlpjs-neo/lang-es': minor
'@nlpjs-neo/lang-eu': minor
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
'@nlpjs-neo/lang-ne': minor
'@nlpjs-neo/lang-nl': minor
'@nlpjs-neo/lang-no': minor
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
'@nlpjs-neo/logger': minor
'@nlpjs-neo/ner': minor
'@nlpjs-neo/neural': minor
'@nlpjs-neo/nlg': minor
'@nlpjs-neo/nlp': minor
'@nlpjs-neo/nlu': minor
'@nlpjs-neo/node-nlp': minor
'@nlpjs-neo/request': minor
'@nlpjs-neo/similarity': minor
'@nlpjs-neo/xtables': minor
---

Describe the rest of the API with real types instead of `any`, and fail the
lint on a new one.

Following on from the core packages, every remaining package now says what it
takes and what it answers: the classifiers and their managers, the entity
extractors and their rules, the answer and action managers, the `nlp` facade,
the connectors, the expression evaluator, the spreadsheet reader, the builtin
extractors, the `node-nlp` compatibility layer and the language packs,
including the registers of every generated Snowball stemmer. Each package
keeps its types in `src/types.ts` and exports them from its index.

`typescript/no-explicit-any` is now an error. Five boundaries stay `any` on
purpose -- interpreted values, pipeline results, rehydrated instances and
open constructors -- and each is a named type carrying a comment that says
why.
