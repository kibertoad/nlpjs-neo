![NLP.js Neo logo](https://raw.githubusercontent.com/kibertoad/nlpjs-neo/main/screenshots/nlplogo.gif)

# @nlpjs-neo/xtables

[![Node.js CI](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/kibertoad/nlpjs-neo/actions/workflows/node.js.yml)
[![NPM version](https://img.shields.io/npm/v/@nlpjs-neo/xtables.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/xtables)
[![NPM downloads](https://img.shields.io/npm/dm/@nlpjs-neo/xtables.svg?style=flat)](https://www.npmjs.com/package/@nlpjs-neo/xtables)

Part of [NLP.js Neo](https://github.com/kibertoad/nlpjs-neo), a refreshed and maintained fork of
[axa-group/nlp.js](https://github.com/axa-group/nlp.js). The packages are ESM only, written
in TypeScript, and require Node.js 22.12 or later.

## Introduction

`@nlpjs-neo/xtables` reads tables out of a spreadsheet. A sheet can hold several tables,
each one a name row, a header row and the data rows, separated by empty rows and columns;
the package finds them and returns each one as a list of objects keyed by column name. It is
what lets an NLP model be defined in an Excel workbook.

## Installation

```bash
pnpm add @nlpjs-neo/xtables
```

## Example of use

```javascript
import { XDoc } from '@nlpjs-neo/xtables';

const xdoc = new XDoc();
xdoc.read('./rules.xls');

const languages = xdoc.getTable('Languages');
console.log(languages.data); // [ { iso2: 'en' }, { iso2: 'es' } ]
```

`XDoc` holds the tables of a workbook, `XTable` is one table, and `XTableUtils` has the
helpers that split a sheet into blocks.

Reading is done with SheetJS `xlsx`, which still carries known advisories; the plan to
replace it is at
[Migrating Excel loading](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/migrate-sheetjs-to-office-kit.md).

The format expected by the NLP manager is documented at
[Loading from Excel](https://github.com/kibertoad/nlpjs-neo/blob/main/docs/v5/loading-from-excel.md).

## Contributing

You can read the guide of how to contribute at [Contributing](https://github.com/kibertoad/nlpjs-neo/blob/main/CONTRIBUTING.md).

## Code of Conduct

You can read the Code of Conduct at [Code of Conduct](https://github.com/kibertoad/nlpjs-neo/blob/main/CODE_OF_CONDUCT.md).

## Who is behind it

NLP.js was created and developed by AXA Group Operations Spain S.A., with Jesus Seijas as
its main author. nlpjs-neo is a maintained fork of that project, kept up by
[Igor Savin](https://github.com/kibertoad) and the
[contributors to the fork](https://github.com/kibertoad/nlpjs-neo/graphs/contributors).

## License

Copyright (c) AXA Group Operations Spain S.A.

Copyright (c) 2026 Igor Savin

Released under the [MIT License](./LICENSE.md).
