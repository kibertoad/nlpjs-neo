---
'@nlpjs-neo/nlg': minor
'@nlpjs-neo/nlp': minor
'@nlpjs-neo/node-nlp': minor
---

Answer with structured data, not only text. A corpus answer can now be a bare object such as `{ type: 'buttons', options: ['yes', 'no'] }`, which is registered as the answer itself, picked at random like any other answer, and handed back as declared once the strings inside it have gone through the `{{ }}` templates. Its `(a|b)` alternatives step is skipped.

`Answer.answer`, `NlgInput.answer`, `LegacyAnswer.response` and `NlpResult.answer` widen from `string` to the new `AnswerPayload` (`string | StructuredAnswer`), so code that assumes a string answer needs a narrowing check. `NlgManager.add`, `remove` and `Nlp.addAnswer` take the same payload, and identical structured answers are deduplicated by content. In `node-nlp`, the Bot Framework recognizer only treats a string answer as a dialog name and sends anything else through `session.send`.
