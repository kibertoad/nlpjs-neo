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
