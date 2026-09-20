# Migrating Excel loading from SheetJS (`xlsx`) to `@office-kit/xlsx`

Status: plan, not started. Written 2026-09-20 against `@office-kit/xlsx` 0.18.0 and `xlsx` 0.18.5.

## Why

`xlsx@0.18.5` is the last SheetJS release on the npm registry. It carries CVE-2023-30533
(prototype pollution) and CVE-2024-22363 (ReDoS). The fixed versions are published only on
cdn.sheetjs.com. `@office-kit/xlsx` is MIT, maintained, on npm, and bounds the cost of
untrusted archives by default.

## What we use SheetJS for

One call site, `packages/xtables/src/xdoc.ts`:

```js
const wb = XLSX.readFile(filename);
for (...) this.processSheet(wb.Sheets[wb.SheetNames[i]]);
```

`processSheet` walks the A1 keys of the sheet object and `XTable` reads `.w` (the formatted
text) of each cell. Nothing else of SheetJS is touched. The call is reached from:

- `XDoc.read(filename)` in `@nlpjs-neo/xtables`
- `NlpExcelReader.load(filename)`, `NlpManager.loadExcel(fileName = 'model.xls')` and
  `Recognizer.loadExcel(filename)` in `node-nlp-neo`

## What was checked

Both libraries were run side by side on this repository's files:

- Sheet order, populated cell set and used range are identical.
- `getCellDisplayText(wb, cell)` equals SheetJS's `cell.w` on all 50 cells of `book1.xlsx`
  and on all 387 cells of `rules.xls` / `rulesnoregex.xls` after converting them to `.xlsx`.
- The unmodified `processSheet`, fed from office-kit, produces tables deep-equal to the
  SheetJS path on all three files.
- `await import('@office-kit/xlsx/io')` from a CommonJS file works with the published 0.18.0.
  `require('@office-kit/xlsx/io')` does not: it throws `ERR_PACKAGE_PATH_NOT_EXPORTED`
  because the package's `exports` map has no `default` or `require` condition.

## Breaking changes this migration causes

All of these go into one major release of `@nlpjs-neo/xtables` and `node-nlp`.

1. `.xls` models stop loading. `@office-kit/xlsx` reads `.xlsx` and `.xlsm` only. The same
   goes for the other formats SheetJS accepted through `readFile` (`.xlsb`, `.ods`, `.csv`).
2. `XDoc.read`, `NlpExcelReader.load` and `NlpManager.loadExcel` become async and return a
   promise. `Recognizer.loadExcel` is already async.
3. The default file name of `NlpManager.loadExcel` changes from `model.xls` to `model.xlsx`.
4. Minimum Node version becomes 22 (office-kit's floor). Node 18 and 20 are end-of-life.

## Steps

### 1. Convert the `.xls` fixtures

`packages/node-nlp/test/nlp/rules.xls` and `rulesnoregex.xls` are BIFF8 files. Convert both
to `.xlsx` and delete the originals:

```sh
soffice --headless --convert-to xlsx packages/node-nlp/test/nlp/rules.xls --outdir packages/node-nlp/test/nlp
soffice --headless --convert-to xlsx packages/node-nlp/test/nlp/rulesnoregex.xls --outdir packages/node-nlp/test/nlp
```

Opening them in Excel and using Save As works too. Every cell in both files is a plain string
in `General` format, so the conversion loses nothing the reader looks at. A SheetJS
`readFile` + `writeFile` round trip was used for the verification above and also works, as a
last use of the old dependency.

### 2. Swap the dependency

In `packages/xtables/package.json` replace `"xlsx": "^0.18.0"` with
`"@office-kit/xlsx": "^0.18.0"`, then `pnpm install`.

The lambda examples under `examples/07-nlpjs-on-aws-lambda` have their own lockfiles that
mention `xlsx` through the published `node-nlp`. They update when they are next bumped to the
new major and need no change now.

### 3. Port `XDoc.read`

`processSheet` and `XTable` stay as they are. Adapt office-kit's cells to the
`{ [ref]: { w } }` shape they already consume:

```js
const SUPPORTED_EXTENSIONS = ['.xlsx', '.xlsm'];

async read(filename) {
  const extension = path.extname(filename).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    throw new Error(
      `Cannot read "${filename}": only .xlsx and .xlsm files are supported. Convert the file with Excel or LibreOffice first.`
    );
  }
  const { loadWorkbook } = await import('@office-kit/xlsx/io');
  const { fromFile } = await import('@office-kit/xlsx/node');
  const { getCellDisplayText } = await import('@office-kit/xlsx/styles');
  const { iterCells } = await import('@office-kit/xlsx/worksheet');
  const { getCoordinate } = await import('@office-kit/xlsx/cell');

  const wb = await loadWorkbook(fromFile(filename));
  for (const ref of wb.sheets) {
    if (ref.kind === 'worksheet') {
      const sheet = {};
      for (const cell of iterCells(ref.sheet)) {
        sheet[getCoordinate(cell)] = { w: getCellDisplayText(wb, cell) };
      }
      this.processSheet(sheet);
    }
  }
}
```

Things to keep in mind:

- Call `processSheet` for empty sheets too. `xdoc.test.js` expects 5 tables from
  `book1.xlsx`: three named tables plus one nameless table for each of the two empty sheets.
- The extension check exists because office-kit 0.18.0 reports a legacy `.xls` as
  "Encrypted xlsx is not supported. Decrypt with msoffcrypto-tool first.", which would send
  users with an old `model.xls` looking for a password that does not exist.
- There is no root import in `@office-kit/xlsx`. Every function lives behind a subpath.
- Dynamic `import()` is used because `require()` of the package fails in 0.18.0. Once
  office-kit adds a `default` export condition, the five imports can become top-level
  `require` calls. That needs Node 22.12 or later for `require(esm)`.
- office-kit throws `OpenXmlError` subclasses on malformed input where SheetJS often returned
  a partial workbook. No test in this repository asserts on SheetJS error text.

### 4. Make the callers async

- `packages/node-nlp/src/nlp/nlp-excel-reader.js`: `async load(filename)` with
  `await this.xdoc.read(filename)`.
- `packages/node-nlp/src/nlp/nlp-manager.js:272`: `async loadExcel(fileName = 'model.xlsx')`
  with `await reader.load(fileName)`. Update the JSDoc.
- `packages/node-nlp/src/recognizer/recognizer.js:76`: `await this.nlpManager.loadExcel(filename)`.
  Without the `await`, training starts before the file is read and the model comes out empty.

### 5. Update the tests

24 call sites need `await` and an `async` test function:

| File | Calls |
| --- | --- |
| `packages/xtables/test/xdoc.test.js` | 6 `xdoc.read(...)` |
| `packages/node-nlp/test/xtables/xdoc.test.js` | 6 `xdoc.read(...)` |
| `packages/node-nlp/test/nlp/nlp-excel-reader.test.js` | 6 `reader.load(...)`, paths change to `.xlsx` |
| `packages/node-nlp/test/nlp/nlp-manager.test.js` | 6 `manager.loadExcel(...)`, paths change to `.xlsx` |

Add one test per package for the new rejection: `read('model.xls')` rejects with the
"only .xlsx and .xlsm" message.

### 6. Update the docs

- `docs/v3/loading-from-excel.md`: point the example link at the new `rules.xlsx` and say
  that only `.xlsx` / `.xlsm` are accepted.
- `docs/v3/microsoft-bot-framework.md`: `./model.xls` becomes `./model.xlsx`, and
  `recognizer.loadExcel(excelName)` gains an `await`.

### 7. Raise the Node floor

- Root `package.json`: `"engines": { "node": ">=22" }`.
- `.github/workflows/node.js.yml`: drop `18.x` and `20.x` from the matrix, add `24.x`.

### 8. Changeset

`pnpm changeset`, major for `@nlpjs-neo/xtables` and `node-nlp`. Write it for users:

- Excel models must be `.xlsx` or `.xlsm`. `.xls` files need a one-time conversion (Save As
  in Excel, or `soffice --headless --convert-to xlsx model.xls`).
- `loadExcel`, `NlpExcelReader.load` and `XDoc.read` return a promise and must be awaited.
- `loadExcel()` with no argument now looks for `model.xlsx`.
- Node 22 or later is required.
- The vulnerable `xlsx@0.18.5` dependency is gone.

## Known behaviour difference

For a number in `General` format, SheetJS's `.w` stops at 11 characters and office-kit keeps
15 significant digits: `0.990566038` versus `0.990566037735849`. Strings and integers are
identical, so our fixtures and the documented model layout are unaffected. A user model with
a computed decimal column would see different text in that column after the upgrade. Mention
it in the release notes if office-kit has not changed it by then.

## Follow-ups in `@office-kit/xlsx`

None of these block the steps above.

- Add a `default` condition to the `exports` map so `require()` works, which lets step 3 drop
  the dynamic imports.
- Report a legacy `.xls` with its own error message.
- Decide whether `General` should cap at 11 characters the way SheetJS does.
- Optionally add a synchronous `loadWorkbookSync`. The load path is already synchronous after
  the bytes are read. It would not change this plan, since dropping `.xls` forces a major
  regardless.

## Out of scope

`@nlpjs-neo/utils` used to write reports with `exceljs`, which would have been a separate
migration. The package was removed, so `@office-kit/xlsx` is now the only spreadsheet
library in the workspace.
