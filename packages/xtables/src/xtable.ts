import type { BlockCell, CellBlock, TableQuery, TableRow } from './types.js';

/**
 * Represents an excel table, where first row is the title, second row the
 * name of each column, and next rows the data.
 */
class XTable {
  declare data: TableRow[];
  /** Column names, from the second row; `_column_<i>` when one is blank. */
  declare keys: string[];
  /** Title of the table, from the first row. */
  declare name: string;

  /**
   * Constructor of the class.
   * @param {Object[][]} matrix Matrix with the data from the excel table.
   */
  constructor(matrix?: CellBlock) {
    this.build(matrix);
  }

  /**
   * Build the instance from a block of the excel representing the table.
   * @param {Object[][]} block Block of data directly from the excel.
   *
   */
  build(matrix?: CellBlock): void {
    this.keys = [];
    this.data = [];
    if (!matrix || matrix.length < 2 || !matrix[0] || matrix[0].length < 1) {
      this.name = '';
      return;
    }
    const titleCell = matrix[0].find(
      (cell: BlockCell | undefined) => cell && cell.w !== undefined
    );
    // A title and a column name are text in every sheet the reader produces,
    // where `w` is the displayed string of the cell.
    this.name = titleCell ? (titleCell.w as string) : '';
    let row = matrix[1];
    for (let i = 0, l = row.length; i < l; i += 1) {
      if (row[i] && row[i].w) {
        this.keys.push(row[i].w as string);
      } else {
        this.keys.push(`_column_${i}`);
      }
    }
    for (let i = 2, li = matrix.length; i < li; i += 1) {
      row = matrix[i];
      const obj: TableRow = {};
      for (let j = 0, lj = row.length; j < lj; j += 1) {
        obj[this.keys[j]] = row[j] && row[j].w ? row[j].w : undefined;
      }
      this.data.push(obj);
    }
  }

  /**
   * Indicates if a row match a given query.
   * @param {Object} row Row to match
   * @param {Object} query Query for the match
   * @returns {boolean} True if the row matchs the query, false otherwise.
   */
  match(row: TableRow, query: TableQuery): boolean {
    for (let i = 0, l = this.keys.length; i < l; i += 1) {
      const key = this.keys[i];
      const value = query[key];
      if (value && value !== row[key]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Given a query, find the rows that match the given query
   * @param {Objet} query Query for the match.
   * @returns {Object[]} Rows that match the query, cloned.
   */
  find(query: TableQuery): TableRow[] {
    const result: TableRow[] = [];
    for (let i = 0, l = this.data.length; i < l; i += 1) {
      const row = this.data[i];
      if (this.match(row, query)) {
        result.push({ ...row });
      }
    }
    return result;
  }

  /**
   * Givena query, find the first row that match the query.
   * @param {Object} query Query for the match.
   * @returns {Object} First row that match the query, cloned.
   */
  findOne(query: TableQuery): TableRow | undefined {
    for (let i = 0, l = this.data.length; i < l; i += 1) {
      const row = this.data[i];
      if (this.match(row, query)) {
        return { ...row };
      }
    }
    return undefined;
  }
}

export default XTable;
