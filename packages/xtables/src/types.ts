import type { SheetCell } from './workbook-reader.js';

/** Types of the spreadsheet reader: the coordinates and the rows it produces. */

/** A zero based position in a sheet. */
export interface Coordinate {
  column: number;
  row: number;
}

/** A rectangular range of a sheet, both corners included. */
export interface CoordinateRange {
  topleft: Coordinate;
  bottomright: Coordinate;
}

/** The area of a sheet that holds cells, as zero based indices. */
export interface SheetRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * A rectangle of cells cut out of a sheet. A missing cell is an empty one,
 * which is what the splitting looks for.
 */
export type CellBlock = (SheetCell | undefined)[][];

/** One row of a table: the formatted text of each cell, by column name. */
export type TableRow = Record<string, string | undefined>;

/** Values a row must carry to match; an absent or empty value matches all. */
export type TableQuery = Record<string, string | undefined>;
