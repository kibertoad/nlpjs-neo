/** Types of the spreadsheet reader: the coordinates and the rows it produces. */

/**
 * A cell as the table builders read it: only the formatted text matters. The
 * reader always writes that as a string; a block built by hand may spell it
 * as the value it stands for.
 */
export interface BlockCell {
  w?: string | number;
}

/**
 * A sheet keyed by A1 reference. A sheet that came from another reader may
 * also carry metadata under keys beginning with `!`, which `getRect` skips.
 */
export type SheetCells = Record<string, BlockCell | unknown>;

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
export type CellBlock = (BlockCell | undefined)[][];

/** One row of a table: the text of each cell, by column name. */
export type TableRow = Record<string, string | number | undefined>;

/** Values a row must carry to match; an absent or empty value matches all. */
export type TableQuery = Record<string, string | number | undefined>;
