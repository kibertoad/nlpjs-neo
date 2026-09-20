# Loading from Excel

The NLP manager can load languages, entities, intents and answers from an Excel file
instead of from code or a corpus JSON.

```javascript
import { NlpManager } from 'node-nlp-neo';

const manager = new NlpManager({ languages: ['en', 'es'], forceNER: true });
manager.loadExcel('./rules.xls');
await manager.train();

const result = await manager.process('en', 'who is spiderman?');
console.log(result.intent); // whois
console.log(result.entities.map((entity) => entity.entity)); // [ 'hero' ]
```

`loadExcel` defaults to `model.xls` when called without a file name. Reading is done by
[`@nlpjs-neo/xtables`](../../packages/xtables), which supports the formats of the `xlsx`
package, `.xls` and `.xlsx` among them. That dependency is SheetJS `xlsx@0.18.5`, which
still carries known advisories; the plan to replace it is in
[Migrating Excel loading](../migrate-sheetjs-to-office-kit.md), so treat workbooks from
untrusted sources with care until it lands.

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

![Tables](../../screenshots/screenshot01.png)
![Tables2](../../screenshots/screenshot02.png)

A working workbook is in the test fixtures, at
[`packages/node-nlp/test/nlp/rules.xls`](../../packages/node-nlp/test/nlp/rules.xls).
