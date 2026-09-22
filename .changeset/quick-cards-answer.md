---
'@nlpjs-neo/console-connector': minor
'@nlpjs-neo/connector': minor
'@nlpjs-neo/core': minor
'@nlpjs-neo/nlg': minor
'@nlpjs-neo/nlp': minor
'@nlpjs-neo/node-nlp': minor
---

Answer with structured data, not only text. A corpus answer can now be a bare object such as `{ type: 'buttons', options: ['yes', 'no'] }`, which is registered as the answer itself, picked at random like any other answer, and handed back as declared once the strings inside it have gone through the `{{ }}` templates. Its `(a|b)` alternatives step is skipped.

`AnswerPayload` (`string | StructuredAnswer`) is declared in `core`, since every layer an answer travels through has to name it, and re-exported from `nlg`. `Answer.answer`, `NlgInput.answer`, `LegacyAnswer.response`, `NlpResult.answer` and `Message.answer` widen from `string` to it, so code that assumes a string answer needs a narrowing check. `NlgManager.add`, `remove`, `addAnswer` and `removeAnswer`, and `Nlp.addAnswer` and `removeAnswer`, take the same payload. In `node-nlp`, the Bot Framework recognizer only treats a string answer as a dialog name and sends anything else through `session.send`; the console connector writes a structured answer out as its data rather than as `[object Object]`.

Identical structured answers are deduplicated by the data they hold rather than by the order their keys happen to be in, and an answer that refers back to itself is compared rather than throwing. The same now goes for the options that gate an answer.

The corpus owns the answers it is taught: a structured answer is copied when it is declared and copied again when it is read, and rendering an answer builds a new one rather than writing to the stored one. Mutating an answer that `process` returned, or the object that declared it, no longer rewrites what an intent answers for every later request, and two requests answered at the same time no longer share one object. This also stops the first request's rendering from being baked into a stored text answer, so `Hello {{ name }}` is rendered afresh for each context.
