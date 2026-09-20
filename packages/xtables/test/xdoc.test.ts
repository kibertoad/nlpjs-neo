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

import { XDoc } from '../src/index.js';
import book1 from './book1.json' with { type: 'json' };
import matrix1 from './matrix1.json' with { type: 'json' };

describe('XDoc', () => {
  describe('Constructor', () => {
    test('It should create an instance', () => {
      const xdoc = new XDoc();
      expect(xdoc).toBeDefined();
      expect(xdoc.tables).toEqual([]);
      expect(xdoc.tablesByName).toEqual({});
    });
  });

  describe('Get Rect', () => {
    test('Given a sheet should return the rect boundary with data', () => {
      const xdoc = new XDoc();
      const result = xdoc.getRect(book1);
      expect(result).toEqual({
        top: 2,
        bottom: 15,
        left: 1,
        right: 6,
      });
    });
  });

  describe('Is Empty Row', () => {
    test('Given a sheet and a row number, return true if the row is empty', () => {
      const xdoc = new XDoc();
      const result = xdoc.isEmptyRow(matrix1, 7);
      expect(result).toBeTruthy();
    });
    test('Given a sheet and a row number, return false if the row is not empty', () => {
      const xdoc = new XDoc();
      const result = xdoc.isEmptyRow(matrix1, 1);
      expect(result).toBeFalsy();
    });
  });

  describe('Find empty row', () => {
    test('It should find an empty row and return the position', () => {
      const xdoc = new XDoc();
      const result = xdoc.findEmptyRow(matrix1);
      expect(result).toEqual(7);
    });
    test('It should return -1 if no empty row found', () => {
      const xdoc = new XDoc();
      const result = xdoc.findEmptyRow(matrix1.slice(0, 6));
      expect(result).toEqual(-1);
    });
  });

  describe('Is empty column', () => {
    test('Given a sheet and a column number, return true if the column is empty', () => {
      const xdoc = new XDoc();
      const result = xdoc.isEmptyColum(matrix1.slice(0, 6), 2);
      expect(result).toBeTruthy();
    });
    test('Given a sheet and a column number, return false if the column is not empty', () => {
      const xdoc = new XDoc();
      const result = xdoc.isEmptyColum(matrix1, 2);
      expect(result).toBeFalsy();
    });
  });

  describe('Find empty column', () => {
    test('It should find an empty column and return the position', () => {
      const xdoc = new XDoc();
      const result = xdoc.findEmptyColumn(matrix1.slice(0, 6));
      expect(result).toEqual(2);
    });
    test('It should return -1 if no empty column found', () => {
      const xdoc = new XDoc();
      const result = xdoc.findEmptyColumn(matrix1);
      expect(result).toEqual(-1);
    });
    test('It should return -1 if the block is empty', () => {
      const xdoc = new XDoc();
      const result = xdoc.findEmptyColumn([]);
      expect(result).toEqual(-1);
    });
  });

  describe('Read', () => {
    test('It should read from an excel file', async () => {
      const xdoc = new XDoc();
      await xdoc.read('./packages/xtables/test/book1.xlsx');
      expect(xdoc.tables).toHaveLength(5);
      expect(xdoc.tables[0]).toEqual({
        keys: ['id', 'name'],
        data: [
          {
            id: '1',
            name: 'name 1',
          },
          {
            id: '2',
            name: 'name 2',
          },
          {
            id: '3',
            name: 'name 3',
          },
          {
            id: '4',
            name: 'name 4',
          },
          {
            id: '5',
            name: 'name 5',
          },
        ],
        name: 'Table 1',
      });
    });

    test('It should read every table of every sheet', async () => {
      const xdoc = new XDoc();
      await xdoc.read('./packages/xtables/test/book1.xlsx');
      // Three named tables on Sheet1, plus a nameless one for each empty sheet.
      expect(xdoc.tables.map((table) => table.name)).toEqual([
        'Table 1',
        'Table 2',
        'Table 3',
        '',
        '',
      ]);
      expect(xdoc.tables[1]).toEqual({
        name: 'Table 2',
        keys: ['id', 'name', '_column_2'],
        data: [
          { id: '1', name: 'name 1', _column_2: 'yes' },
          { id: '2', name: 'name 2', _column_2: 'no' },
          { id: '3', name: 'name 3', _column_2: undefined },
          { id: '4', name: 'name 4', _column_2: 'yes' },
          { id: '5', name: 'name 5', _column_2: 'no' },
        ],
      });
    });

    /*
     * Excel writes a cell for anything the user has ever formatted, value or
     * not. A blank-but-styled column still separates two tables, so the reader
     * has to tell "formatted" from "populated".
     */
    test('It should not treat a blank but styled column as data', async () => {
      const xdoc = new XDoc();
      await xdoc.read('./packages/xtables/test/styled-blanks.xlsx');
      expect(xdoc.tables.map((table) => table.name)).toEqual(['Left', 'Right']);
      expect(xdoc.getTable('Left')).toEqual({
        name: 'Left',
        keys: ['id', 'name'],
        data: [
          { id: '1', name: 'one' },
          { id: '2', name: 'two' },
        ],
      });
    });

    /*
     * Pins how a General-format number reaches the tables: as the display text
     * the spreadsheet library produces, never as a number, and at full
     * precision. SheetJS truncated General to 11 characters and lost the rest
     * of the value; 15 significant digits is what the cell actually holds.
     */
    test('It should read a number as its display text', async () => {
      const xdoc = new XDoc();
      await xdoc.read('./packages/xtables/test/styled-blanks.xlsx');
      expect(xdoc.getTable('Right').data).toEqual([
        { id: '1', ratio: '0.990566037735849' },
        { id: '2', ratio: '0.5' },
      ]);
    });

    test('It should reject a file whose extension it cannot read', async () => {
      const xdoc = new XDoc();
      await expect(xdoc.read('./model.xls')).rejects.toThrow(
        'only .xlsx and .xlsm files are supported'
      );
    });
  });

  describe('Get Table', () => {
    test('It should get a table by name', async () => {
      const xdoc = new XDoc();
      await xdoc.read('./packages/xtables/test/book1.xlsx');
      const table = xdoc.getTable('Table 1');
      expect(table).toEqual({
        keys: ['id', 'name'],
        data: [
          {
            id: '1',
            name: 'name 1',
          },
          {
            id: '2',
            name: 'name 2',
          },
          {
            id: '3',
            name: 'name 3',
          },
          {
            id: '4',
            name: 'name 4',
          },
          {
            id: '5',
            name: 'name 5',
          },
        ],
        name: 'Table 1',
      });
    });
  });

  describe('Find', () => {
    test('It should find records in a table by a query', async () => {
      const xdoc = new XDoc();
      await xdoc.read('./packages/xtables/test/book1.xlsx');
      const rows = xdoc.find('Table 3', { flag: 'yes' });
      expect(rows).toHaveLength(2);
      expect(rows[0]).toEqual({
        id: '1',
        name: 'name 1',
        flag: 'yes',
        other: '11',
      });
    });
    test('If the table does not exists, return empty array', async () => {
      const xdoc = new XDoc();
      await xdoc.read('./packages/xtables/test/book1.xlsx');
      const rows = xdoc.find('Table 4', { flag: 'yes' });
      expect(rows).toEqual([]);
    });
  });

  describe('Find one', () => {
    test('It should find a row in a table by a query', async () => {
      const xdoc = new XDoc();
      await xdoc.read('./packages/xtables/test/book1.xlsx');
      const row = xdoc.findOne('Table 3', { flag: 'yes' });
      expect(row).toEqual({
        id: '1',
        name: 'name 1',
        flag: 'yes',
        other: '11',
      });
    });
    test('If the table does not exists, return undefined', async () => {
      const xdoc = new XDoc();
      await xdoc.read('./packages/xtables/test/book1.xlsx');
      const row = xdoc.findOne('Table 4', { flag: 'yes' });
      expect(row).toBeUndefined();
    });
  });
});
