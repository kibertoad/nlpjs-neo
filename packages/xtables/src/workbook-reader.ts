/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import path from 'node:path';
import { getCoordinate, isEmptyCell } from '@office-kit/xlsx/cell';
import { loadWorkbook } from '@office-kit/xlsx/io';
import { fromFile } from '@office-kit/xlsx/node';
import { getCellDisplayText } from '@office-kit/xlsx/styles';
import { iterCells } from '@office-kit/xlsx/worksheet';

/**
 * The spreadsheet formats `@office-kit/xlsx` reads. The legacy formats SheetJS
 * also accepted (`.xls`, `.xlsb`, `.ods`, `.csv`) need a one-time conversion.
 */
export const SUPPORTED_EXTENSIONS = ['.xlsx', '.xlsm'];

/**
 * A cell as the table builders consume it: only the formatted text matters.
 */
export interface SheetCell {
  w: string;
}

/**
 * A sheet keyed by A1 reference, the shape `XDoc.processSheet` walks.
 */
export type SheetCells = Record<string, SheetCell>;

/**
 * Read every worksheet of a workbook as a map of A1 reference to formatted
 * text. Chartsheets are skipped; empty worksheets are kept, because a sheet
 * with no cells still stands for one (nameless) table.
 *
 * Cells that carry a style but no value are skipped. Excel writes one of those
 * for every cell the user has ever formatted, and counting them as data would
 * stop a blank-but-styled column from separating two tables.
 *
 * @param {String} filename Path to a `.xlsx` or `.xlsm` file.
 */
export async function readSheets(filename: string): Promise<SheetCells[]> {
  const extension = path.extname(filename).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    throw new Error(
      `Cannot read "${filename}": only ${SUPPORTED_EXTENSIONS.join(' and ')} files are supported. Convert the file with Excel or LibreOffice first.`
    );
  }
  const workbook = await loadWorkbook(fromFile(filename));
  const sheets: SheetCells[] = [];
  for (const entry of workbook.sheets) {
    if (entry.kind !== 'worksheet') {
      continue;
    }
    const cells: SheetCells = {};
    for (const cell of iterCells(entry.sheet)) {
      if (!isEmptyCell(cell)) {
        cells[getCoordinate(cell)] = { w: getCellDisplayText(workbook, cell) };
      }
    }
    sheets.push(cells);
  }
  return sheets;
}
