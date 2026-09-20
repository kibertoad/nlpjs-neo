---
'@nlpjs-neo/mongodb-adapter': major
---

Upgrade `mongodb` from 3 to `^7.6.0` and rewrite the adapter for it.

Every major since 4 was breaking, and the adapter used three things that are
gone:

- `useNewUrlParser` and `useUnifiedTopology`, removed in driver 4. Both are the
  only behaviour now, so the options are dropped.
- Callbacks, removed in driver 5. `connect` and every collection operation are
  awaited, and `executeInCollection` no longer wraps a callback in a promise.
  `disconnect` returns a promise as well, and clears the connection so a later
  call reports the adapter as not initialized.
- `insertOne` returning `result.ops[0]`, removed in driver 4. The generated id
  comes back as `result.insertedId` and is merged into the stored document.

Replacing the hand-written callback mocks in the test suite with a real `mongod`
turned up four defects the mocks had hidden:

- `insertMany` answered with the driver's own result -- counts and ids -- rather
  than the inserted documents, so no caller could read back what it stored. It
  now answers like `insertOne`, with the documents.
- `save` on an existing item answered with the raw `updateOne` result, which
  carries no document. It now answers with the saved item.
- `convertOut` turned a document that was not found into an empty object, which
  reads as a hit. It now passes `null` through, which also repairs `save`: an
  item carrying a well formed id that nothing is stored under was taking the
  update path and silently storing nothing, and is now inserted.
- `convertIn` converted the elements of an array with `convertOut`, so an
  explicit `id` on a bulk insert was dropped and replaced by a generated one.

Two smaller fixes: `connect` used `this.dbName`, which is never assigned, so the
database came from the connection string whatever `settings.dbName` said; and
`settings.dbName`, when derived from the url, took a query string with it. Both
are corrected.

Driver 7 rejects an undefined url where driver 3 accepted it, and the container
builds this adapter from configuration before a url is necessarily known, so the
client is only built once there is a url and `connect` reports a missing one with
a clear message.
