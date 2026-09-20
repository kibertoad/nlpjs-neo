# Loading from Excel

The NLP manager can load languages, entities, intents and answers from an Excel file
instead of from code or a corpus JSON.

```javascript
import { NlpManager } from 'node-nlp-neo';

const manager = new NlpManager({ languages: ['en', 'es'], forceNER: true });
await manager.loadExcel('./rules.xlsx');
await manager.train();

const result = await manager.process('en', 'who is spiderman?');
console.log(result.intent); // whois
console.log(result.entities.map((entity) => entity.entity)); // [ 'hero' ]
```

`loadExcel` returns a promise and must be awaited. It defaults to `model.xlsx` when called
without a file name. Reading is done by [`@nlpjs-neo/xtables`](../../packages/xtables) on
top of [`@office-kit/xlsx`](https://www.npmjs.com/package/@office-kit/xlsx), which reads
`.xlsx` and `.xlsm` only. A legacy `.xls` workbook is rejected with a message telling you to
convert it; Excel's Save As does it, as does
`soffice --headless --convert-to xlsx model.xls`.

## File format

The workbook holds one table per kind of data. A table starts with a row containing its
name, followed by a row with the column names, followed by one row per record. Several
tables can live in the same sheet, separated by an empty row.

| Table | Columns | Required |
| ----- | ------- | -------- |
| `Languages` | `iso2` | Yes |
| `Named Entities` | `entity`, `option`, `language`, `text` | Yes |
| `Regex Entities` | `entity`, `language`, `regex` | No |
| `Intents` | `intent`, `language`, `utterance` | Yes |
| `Responses` | `intent`, `language`, `response`, `condition`, `url` | Yes |

Notes:

- `language` accepts several comma-separated locales, for example `en,es`.
- In `Named Entities`, one row per synonym: the `option` is the resolved value and `text` is
  the string to recognize.
- In `Intents`, entities are referenced in the utterance with `%entityName%`, as in
  `who is %hero%?`.
- In `Responses`, `condition` is an optional JavaScript expression over the entities, such as
  `hero === 'spiderman'`, and `url` is optional.
- Every cell is read as the text the spreadsheet displays, never as a number or a date. A
  `General`-format number keeps 15 significant digits, so a computed decimal arrives as
  `0.990566037735849` rather than truncated; round it where you consume it if you want
  fewer.

![Tables](../../screenshots/screenshot01.png)
![Tables2](../../screenshots/screenshot02.png)

A working workbook is in the test fixtures, at
[`packages/node-nlp/test/nlp/rules.xlsx`](../../packages/node-nlp/test/nlp/rules.xlsx).
