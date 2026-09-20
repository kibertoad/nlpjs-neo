---
'@nlpjs-neo/fullbot': major
---

Replace `decompress` with `node-stream-zip`.

`decompress` 4.2.1 has three open advisories, one of them a critical arbitrary
file write outside the extraction folder (zip slip). It has had no release since
April 2020 and no patched version exists. `node-stream-zip` 1.16.0 has no
dependencies and refuses entries that resolve outside the target folder.

`restore` changes in two ways:

- It rejects on an archive it cannot read, where `decompress` resolved with an
  empty list. `mount` relies on that rejection to roll back to its backup, so a
  corrupt download no longer leaves the bot folder empty.
- It resolves with the number of extracted entries instead of a list of file
  descriptors.
