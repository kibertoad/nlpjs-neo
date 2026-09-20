---
'@nlpjs-neo/directline-connector': minor
---

Upgrade `formidable` from 2 to `^3.5.4`, and repair the upload route.

The handler read `files.activity.path`, which formidable renamed to `filepath`
in version 2, so `POST /directline/conversations/:conversationId/upload` threw
for every request. Version 3 also groups every field into an array and resolves
from `form.parse` instead of taking a callback, so the handler now reads
`files.activity[0].filepath` and awaits the parse.

The route gains an integration suite, and two behaviour improvements come with
it: the upload folder is created if it does not exist, and temporary files are
removed on the error path too, not only on success.
