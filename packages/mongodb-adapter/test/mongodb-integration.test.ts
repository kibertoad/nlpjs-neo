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

import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongodbAdapter } from '../src/index.js';

// Starting `mongod` costs a few seconds, so one server serves the whole file
// and each test works in a collection of its own.
let server: MongoMemoryServer;
let adapter: any;

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  adapter = new MongodbAdapter({ url: `${server.getUri()}nlpjs` });
  await adapter.connect();
}, 120000);

afterAll(async () => {
  if (adapter) {
    await adapter.disconnect();
  }
  if (server) {
    await server.stop();
  }
});

let counter = 0;
/** A collection name no other test has used. */
function collection(): string {
  counter += 1;
  return `items_${counter}`;
}

describe('MongodbAdapter against a real mongod', () => {
  describe('connect', () => {
    test('It should refuse to work before connect is called', async () => {
      const disconnected = new MongodbAdapter({ url: server.getUri() });
      await expect(disconnected.find('anything')).rejects.toThrow(
        'It seems that mongodb is not initialized, try invoking connect()'
      );
    });

    test('It should use the database named in the url', async () => {
      const name = collection();
      await adapter.insertOne(name, { marker: 'in nlpjs' });
      const databases = await adapter.client.db('nlpjs').collections();
      expect(databases.map((one) => one.collectionName)).toContain(name);
    });

    test('It should reject when no url was provided at all', async () => {
      const previous = process.env.MONGO_URL;
      delete process.env.MONGO_URL;
      try {
        const urlless = new MongodbAdapter();
        await expect(urlless.connect()).rejects.toThrow(
          'No mongodb url was provided'
        );
      } finally {
        if (previous === undefined) {
          delete process.env.MONGO_URL;
        } else {
          process.env.MONGO_URL = previous;
        }
      }
    });

    test('It should read the database name past a query string', () => {
      const withQuery = new MongodbAdapter({
        url: 'mongodb://127.0.0.1:27017/nlpjs?retryWrites=true&w=majority',
      });
      expect(withQuery.settings.dbName).toEqual('nlpjs');
    });

    test('It should leave the database name unset when the url names none', () => {
      const noDatabase = new MongodbAdapter({
        url: 'mongodb://127.0.0.1:27017/',
      });
      expect(noDatabase.settings.dbName).toBeUndefined();
    });

    test('It should reject after disconnect', async () => {
      const own = new MongodbAdapter({ url: `${server.getUri()}nlpjs` });
      await own.connect();
      await own.disconnect();
      await expect(own.find('anything')).rejects.toThrow(
        'It seems that mongodb is not initialized, try invoking connect()'
      );
    });

    test('It should reject when the server cannot be reached', async () => {
      // The adapter forwards no client options, so the server selection
      // timeout is shortened through the connection string instead of waiting
      // out the 30 second default.
      const unreachable = new MongodbAdapter({
        url: 'mongodb://127.0.0.1:1/nlpjs?serverSelectionTimeoutMS=250',
      });
      await expect(unreachable.connect()).rejects.toBeDefined();
    }, 30000);
  });

  describe('insertOne', () => {
    test('It should return the item with a string id', async () => {
      const name = collection();
      const actual = await adapter.insertOne(name, { name: 'user 1' });
      expect(actual.name).toEqual('user 1');
      expect(typeof actual.id).toEqual('string');
      // `convertOut` replaces the driver's `_id` with a string `id`.
      expect(Object.keys(actual)).not.toContain('_id');
    });

    test('It should store the item so it can be read back', async () => {
      const name = collection();
      const inserted = await adapter.insertOne(name, { name: 'user 1' });
      const actual = await adapter.findById(name, inserted.id);
      expect(actual.name).toEqual('user 1');
      expect(actual.id).toEqual(inserted.id);
    });
  });

  describe('insertMany', () => {
    test('It should return every item with an id', async () => {
      const name = collection();
      const actual = await adapter.insertMany(name, [
        { name: 'user 1' },
        { name: 'user 2' },
      ]);
      expect(actual).toHaveLength(2);
      expect(actual.map((one) => one.name)).toEqual(['user 1', 'user 2']);
      for (const one of actual) {
        expect(typeof one.id).toEqual('string');
      }
    });

    test('It should keep the ids the items already carry', async () => {
      const name = collection();
      const actual = await adapter.insertMany(name, [
        { id: 'first', name: 'user 1' },
        { id: 'second', name: 'user 2' },
      ]);
      expect(actual.map((one) => one.id)).toEqual(['first', 'second']);
      const stored = await adapter.find(name);
      expect(stored.map((one) => one.id).sort()).toEqual(['first', 'second']);
    });

    test('It should store every item', async () => {
      const name = collection();
      await adapter.insertMany(name, [{ num: 1 }, { num: 2 }, { num: 3 }]);
      const actual = await adapter.find(name);
      expect(actual).toHaveLength(3);
    });
  });

  describe('find', () => {
    test('It should return every document of the collection', async () => {
      const name = collection();
      await adapter.insertMany(
        name,
        Array.from({ length: 20 }, (_unused, num) => ({ num, mod: num % 5 }))
      );
      const actual = await adapter.find(name);
      expect(actual).toHaveLength(20);
      expect(actual.every((one) => typeof one.id === 'string')).toEqual(true);
    });

    test('It should apply a condition', async () => {
      const name = collection();
      await adapter.insertMany(
        name,
        Array.from({ length: 20 }, (_unused, num) => ({ num, mod: num % 5 }))
      );
      const actual = await adapter.find(name, { mod: 2 });
      expect(actual).toHaveLength(4);
      expect(actual.map((one) => one.num).sort((a, b) => a - b)).toEqual([
        2, 7, 12, 17,
      ]);
    });

    test('It should apply a limit', async () => {
      const name = collection();
      await adapter.insertMany(
        name,
        Array.from({ length: 20 }, (_unused, num) => ({ num }))
      );
      expect(await adapter.find(name, {}, 5)).toHaveLength(5);
    });

    test('It should apply an offset', async () => {
      const name = collection();
      await adapter.insertMany(
        name,
        Array.from({ length: 20 }, (_unused, num) => ({ num }))
      );
      const actual = await adapter.find(name, {}, 5, 18);
      expect(actual).toHaveLength(2);
    });

    test('It should apply a sort', async () => {
      const name = collection();
      await adapter.insertMany(name, [{ num: 3 }, { num: 1 }, { num: 2 }]);
      const actual = await adapter.find(name, {}, undefined, undefined, {
        num: -1,
      });
      expect(actual.map((one) => one.num)).toEqual([3, 2, 1]);
    });

    test('It should return an empty array when nothing matches', async () => {
      const name = collection();
      await adapter.insertOne(name, { num: 1 });
      expect(await adapter.find(name, { num: 99 })).toEqual([]);
    });
  });

  describe('findOne', () => {
    test('It should return the first document', async () => {
      const name = collection();
      await adapter.insertMany(
        name,
        Array.from({ length: 10 }, (_unused, num) => ({ num }))
      );
      const actual = await adapter.findOne(name);
      expect(actual.num).toEqual(0);
    });

    test('It should apply a condition', async () => {
      const name = collection();
      await adapter.insertMany(
        name,
        Array.from({ length: 10 }, (_unused, num) => ({ num }))
      );
      const actual = await adapter.findOne(name, { num: 7 });
      expect(actual.num).toEqual(7);
    });
  });

  describe('findById', () => {
    test('It should return null for an id that is not an ObjectId', async () => {
      const name = collection();
      expect(await adapter.findById(name, 'not an object id')).toBeNull();
    });

    test('It should return null for an id nothing is stored under', async () => {
      const name = collection();
      await adapter.insertOne(name, { name: 'user 1' });
      // A well formed id that belongs to no document. A missing document has to
      // read as missing: `save` decides between insert and update on it.
      expect(
        await adapter.findById(name, '0123456789abcdef01234567')
      ).toBeNull();
    });
  });

  describe('findOne when nothing matches', () => {
    test('It should return null rather than an empty object', async () => {
      const name = collection();
      await adapter.insertOne(name, { num: 1 });
      expect(await adapter.findOne(name, { num: 99 })).toBeNull();
    });
  });

  describe('save', () => {
    test('It should insert an item that has no id', async () => {
      const name = collection();
      const actual = await adapter.save(name, { name: 'user 1' });
      expect(typeof actual.id).toEqual('string');
      expect(await adapter.find(name)).toHaveLength(1);
    });

    test('It should insert an item whose id is not an ObjectId', async () => {
      const name = collection();
      const actual = await adapter.save(name, {
        id: 'patata',
        name: 'user 1',
      });
      expect(actual.id).toBeDefined();
      expect(await adapter.find(name)).toHaveLength(1);
    });

    test('It should insert an item whose id nothing is stored under', async () => {
      const name = collection();
      const actual = await adapter.save(name, {
        id: '0123456789abcdef01234567',
        name: 'user 1',
      });
      expect(actual.id).toEqual('0123456789abcdef01234567');
      expect(await adapter.find(name)).toHaveLength(1);
    });

    test('It should update an item that is already stored', async () => {
      const name = collection();
      const stored = await adapter.save(name, { name: 'user 1' });
      const actual = await adapter.save(name, { ...stored, age: 30 });
      expect(actual.id).toEqual(stored.id);
      expect(actual.name).toEqual('user 1');
      expect(actual.age).toEqual(30);
      expect(await adapter.find(name)).toHaveLength(1);
      const reread = await adapter.findById(name, stored.id);
      expect(reread.age).toEqual(30);
      expect(reread.name).toEqual('user 1');
    });
  });

  describe('remove', () => {
    test('It should remove every matching document', async () => {
      const name = collection();
      await adapter.insertMany(
        name,
        Array.from({ length: 10 }, (_unused, num) => ({ num, mod: num % 2 }))
      );
      await adapter.remove(name, { mod: 0 });
      expect(await adapter.find(name)).toHaveLength(5);
    });

    test('It should remove one document when justOne is set', async () => {
      const name = collection();
      await adapter.insertMany(
        name,
        Array.from({ length: 10 }, (_unused, num) => ({ num, mod: num % 2 }))
      );
      await adapter.remove(name, { mod: 0 }, true);
      expect(await adapter.find(name)).toHaveLength(9);
    });

    test('It should remove the whole collection with no condition', async () => {
      const name = collection();
      await adapter.insertMany(name, [{ num: 1 }, { num: 2 }]);
      await adapter.remove(name);
      expect(await adapter.find(name)).toEqual([]);
    });
  });

  describe('removeById', () => {
    test('It should remove the document with that id', async () => {
      const name = collection();
      const stored = await adapter.insertOne(name, { name: 'user 1' });
      await adapter.insertOne(name, { name: 'user 2' });
      await adapter.removeById(name, stored.id);
      const actual = await adapter.find(name);
      expect(actual.map((one) => one.name)).toEqual(['user 2']);
    });

    test('It should return null for an id that is not an ObjectId', async () => {
      const name = collection();
      expect(await adapter.removeById(name, 'not an object id')).toBeNull();
    });
  });

  describe('createId', () => {
    test('It should build an ObjectId that round-trips', async () => {
      const name = collection();
      const stored = await adapter.insertOne(name, { name: 'user 1' });
      const id = adapter.createId(stored.id);
      const actual = await adapter.findOne(name, { _id: id });
      expect(actual.id).toEqual(stored.id);
    });
  });
});
