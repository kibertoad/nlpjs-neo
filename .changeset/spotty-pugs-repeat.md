---
'@nlpjs-neo/xtables': major
'node-nlp-neo': major
---

Read Excel with `@office-kit/xlsx` instead of SheetJS `xlsx`, which had no npm release
since 2022 and carried two unfixed advisories (CVE-2023-30533, CVE-2024-22363).

Breaking changes:

- **Only `.xlsx` and `.xlsm` are read.** A `.xls` model needs a one-time conversion:
  Save As in Excel, or `soffice --headless --convert-to xlsx model.xls`. The other
  formats SheetJS accepted (`.xlsb`, `.ods`, `.csv`) are gone too. Passing one now
  rejects with a message that says so, rather than failing deeper in the reader.
- **`XDoc.read`, `NlpExcelReader.load` and `NlpManager.loadExcel` return a promise** and
  must be awaited. `Recognizer.loadExcel` was already async and its signature is
  unchanged.
- **`NlpManager.loadExcel()` with no argument now looks for `model.xlsx`**, not
  `model.xls`.

Also fixed: `Recognizer.loadExcel` did not await the workbook load, so training could
start before the model was read. That was latent while the load was synchronous and would
have become a silent "model comes out empty" bug with this change.

One behaviour difference to know about: for a number in `General` format, SheetJS capped
the displayed text at 11 characters and `@office-kit/xlsx` keeps 15 significant digits
(`0.990566038` becomes `0.990566037735849`). Strings and integers are unaffected, so a
model only sees this in a computed decimal column.
