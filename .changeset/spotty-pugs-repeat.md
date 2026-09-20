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

Improved: a number in `General` format now keeps its precision. SheetJS truncated the
displayed text to 11 characters, so `0.990566037735849` reached a model as
`0.990566038` and the rest of the value was simply lost. `@office-kit/xlsx` keeps 15
significant digits, which is what the cell actually holds.

This is visible to anyone whose workbook has a computed decimal column: those values
arrive longer and more accurate than before. Strings and integers are unchanged. If you
were relying on the old truncation as rounding, round explicitly where you consume the
value.
