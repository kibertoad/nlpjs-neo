import { readSheets } from './workbook-reader.js';
import XTable from './xtable.js';
import XTableUtils from './xtable-utils.js';

class XDoc {
  declare tables: any;
  declare tablesByName: any;

  constructor() {
    this.tables = [];
    this.tablesByName = {};
  }

  getRect(sheet) {
    const keys = Object.keys(sheet);
    let minRow;
    let maxRow;
    let minColumn;
    let maxColumn;
    for (let i = 0, l = keys.length; i < l; i += 1) {
      const key = keys[i];
      if (key[0] !== '!') {
        const coord = XTableUtils.excel2coord(key);
        if (minColumn === undefined || minColumn > coord.column) {
          minColumn = coord.column;
        }
        if (maxColumn === undefined || maxColumn < coord.column) {
          maxColumn = coord.column;
        }
        if (minRow === undefined || minRow > coord.row) {
          minRow = coord.row;
        }
        if (maxRow === undefined || maxRow < coord.row) {
          maxRow = coord.row;
        }
      }
    }
    return {
      top: minRow,
      bottom: maxRow,
      left: minColumn,
      right: maxColumn,
    };
  }

  isEmptyRow(block, index) {
    const row = block[index];
    if (!row) {
      return true;
    }
    for (let i = 0; i < row.length; i += 1) {
      if (row[i]) {
        return false;
      }
    }
    return true;
  }

  findEmptyRow(block) {
    for (let i = 0; i < block.length; i += 1) {
      if (this.isEmptyRow(block, i)) {
        return i;
      }
    }
    return -1;
  }

  isEmptyColum(block, index) {
    for (let i = 0; i < block.length; i += 1) {
      if (block[i][index]) {
        return false;
      }
    }
    return true;
  }

  findEmptyColumn(block) {
    if (!block || block.length === 0) {
      return -1;
    }
    const l = block[0].length;
    for (let i = 0; i < l; i += 1) {
      if (this.isEmptyColum(block, i)) {
        return i;
      }
    }
    return -1;
  }

  splitByRow(block, emptyRowIndex, nextEmptyRowIndex) {
    const block1: any[] = [];
    const block2: any[] = [];
    for (let i = 0; i < block.length; i += 1) {
      if (i < emptyRowIndex) {
        block1.push(block[i]);
      } else if (i > nextEmptyRowIndex) {
        block2.push(block[i]);
      }
    }
    return [block1, block2];
  }

  splitByColumn(block, emptyColumnIndex, nextEmptyColumnIndex) {
    const block1: any[] = [];
    const block2: any[] = [];
    for (let i = 0; i < block.length; i += 1) {
      const row = block[i];
      const row1: any[] = [];
      const row2: any[] = [];
      block1.push(row1);
      block2.push(row2);
      for (let j = 0; j < row.length; j += 1) {
        if (j < emptyColumnIndex) {
          row1.push(row[j]);
        } else if (j > nextEmptyColumnIndex) {
          row2.push(row[j]);
        }
      }
    }
    if (block2[0].length === 0) {
      return [block1];
    }
    if (block1[0].length === 0) {
      return [block2];
    }
    return [block1, block2];
  }

  splitBlock(block) {
    const emptyRowIndex = this.findEmptyRow(block);
    if (emptyRowIndex > -1) {
      let nextEmptyRowIndex = emptyRowIndex;
      while (
        nextEmptyRowIndex < block.length &&
        this.isEmptyRow(block, nextEmptyRowIndex + 1)
      ) {
        nextEmptyRowIndex += 1;
      }
      return this.splitByRow(block, emptyRowIndex, nextEmptyRowIndex);
    }
    const emptyColumnIndex = this.findEmptyColumn(block);
    if (emptyColumnIndex > -1) {
      let nextEmptyColumnIndex = emptyColumnIndex;
      while (
        nextEmptyColumnIndex < block[0].length &&
        this.isEmptyColum(block, nextEmptyColumnIndex + 1)
      ) {
        nextEmptyColumnIndex += 1;
      }
      return this.splitByColumn(block, emptyColumnIndex, nextEmptyColumnIndex);
    }
    return [block];
  }

  processSheet(sheet) {
    const rect = this.getRect(sheet);
    let pendingBlocks: any[] = [];
    let currentBlock: any[] = [];
    for (let j = rect.top; j <= rect.bottom; j += 1) {
      const currentRow: any[] = [];
      currentBlock.push(currentRow);
      for (let i = rect.left; i <= rect.right; i += 1) {
        const cellRef = XTableUtils.coord2excel({ row: j, column: i });
        currentRow.push(sheet[cellRef]);
      }
    }
    pendingBlocks.push(currentBlock);
    let modified = true;
    while (modified) {
      modified = false;
      const oldBlocks = pendingBlocks;
      pendingBlocks = [];
      for (let i = 0; i < oldBlocks.length; i += 1) {
        currentBlock = oldBlocks[i];
        const newBlocks = this.splitBlock(currentBlock);
        if (newBlocks.length > 1 && !modified) {
          modified = true;
        }
        for (let j = 0; j < newBlocks.length; j += 1) {
          pendingBlocks.push(newBlocks[j]);
        }
      }
    }
    for (let i = 0; i < pendingBlocks.length; i += 1) {
      const table = new XTable(pendingBlocks[i]);
      this.tables.push(table);
      this.tablesByName[table.name] = table;
    }
  }

  /**
   * Read every sheet of an excel file into tables.
   * @param {String} filename Path to a `.xlsx` or `.xlsm` file.
   */
  async read(filename) {
    const sheets = await readSheets(filename);
    for (let i = 0, l = sheets.length; i < l; i += 1) {
      this.processSheet(sheets[i]);
    }
  }

  getTable(name) {
    return this.tablesByName[name];
  }

  find(name, query?) {
    const table = this.tablesByName[name];
    if (!table) {
      return [];
    }
    return table.find(query);
  }

  findOne(name, query) {
    const table = this.tablesByName[name];
    if (!table) {
      return undefined;
    }
    return table.findOne(query);
  }
}

export default XDoc;
