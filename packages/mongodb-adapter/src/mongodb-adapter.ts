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

import * as mongodb from 'mongodb';
import { MongoClient, ObjectId } from 'mongodb';
import { Clonable } from '@nlpjs-neo/core';

const idField = '_id';

/**
 * The database a url names, or `undefined` when it names none. `mongodb` reads
 * the database from the connection string itself in that case.
 */
function databaseFromUrl(url: string): string | undefined {
  const path = url.slice(url.lastIndexOf('/') + 1).split('?')[0];
  return path.length > 0 ? path : undefined;
}

class MongodbAdapter extends Clonable {
  declare client: any;
  declare db: any;
  declare dbName: any;
  declare driver: any;
  declare mongoClient: any;
  declare settings: any;

  constructor(settings: any = {}, container = undefined) {
    super(
      {
        settings: {},
        container: settings.container || container,
      },
      container
    );
    this.applySettings(this.settings, settings);
    if (!this.settings.tag) {
      this.settings.tag = 'mongodb-adapter';
    }
    if (!this.settings.url) {
      this.settings.url = process.env.MONGO_URL;
    }
    if (!this.settings.dbName && this.settings.url) {
      this.settings.dbName = databaseFromUrl(this.settings.url);
    }
    // `useNewUrlParser` and `useUnifiedTopology` were removed in driver 4;
    // both are the only behaviour now. Driver 7 also rejects an undefined url
    // where driver 3 accepted it, and the container builds this adapter from
    // configuration before a url is necessarily known, so the client waits for
    // one rather than throwing here.
    if (this.settings.url) {
      this.mongoClient = new MongoClient(this.settings.url);
    }
    this.registerDefault();
    this.driver = mongodb;
  }

  registerDefault() {
    const database = this.container
      ? this.container.get('database')
      : undefined;
    if (database) {
      database.registerAdapter('mongodb', this);
      database.defaultAdapter = 'mongodb';
    }
  }

  async connect() {
    if (!this.mongoClient) {
      throw new Error(
        'No mongodb url was provided, set settings.url or the MONGO_URL environment variable'
      );
    }
    this.client = await this.mongoClient.connect();
    this.db = this.client.db(this.settings.dbName);
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = undefined;
      this.db = undefined;
    }
  }

  convertOut(srcInput) {
    if (Array.isArray(srcInput)) {
      const result: any[] = [];
      for (let i = 0; i < srcInput.length; i += 1) {
        result.push(this.convertOut(srcInput[i]));
      }
      return result;
    }
    // A document that is not there stays not there. Spreading `null` would
    // answer with an empty object, which reads as a hit to every caller.
    if (srcInput === null || srcInput === undefined) {
      return srcInput;
    }
    const input = { ...srcInput };
    if (input[idField]) {
      input.id = input[idField].toString();
      delete input[idField];
    }
    return input;
  }

  convertIn(srcInput) {
    if (Array.isArray(srcInput)) {
      const result: any[] = [];
      for (let i = 0; i < srcInput.length; i += 1) {
        result.push(this.convertIn(srcInput[i]));
      }
      return result;
    }
    const input = { ...srcInput };
    if (input.id) {
      input[idField] = input.id;
      delete input.id;
    }
    return input;
  }

  /**
   * Runs `fn` against a collection. Driver 5 removed callbacks, so every
   * operation is awaited and its rejection propagates to the caller.
   */
  async executeInCollection(name, fn) {
    if (!this.db) {
      throw new Error(
        'It seems that mongodb is not initialized, try invoking connect()'
      );
    }
    return fn(this.db.collection(name));
  }

  createId(key) {
    return new ObjectId(key);
  }

  async find(name, condition?, limit?, offset?, sort?) {
    return this.executeInCollection(name, async (collection) => {
      const options: any = {};
      if (limit) {
        options.limit = limit;
      }
      if (offset) {
        options.skip = offset;
      }
      if (sort) {
        options.sort = sort;
      }
      const result = await collection.find(condition || {}, options).toArray();
      return this.convertOut(result);
    });
  }

  async findOne(name, condition: any = {}): Promise<any> {
    return this.executeInCollection(name, async (collection) => {
      const result = await collection.findOne(condition);
      return this.convertOut(result);
    });
  }

  async findById(name, id): Promise<any> {
    let oId;
    try {
      oId = new ObjectId(id);
    } catch {
      return null;
    }
    return this.findOne(name, { [idField]: oId });
  }

  async insertOne(name, srcItem): Promise<any> {
    return this.executeInCollection(name, async (collection) => {
      const item = this.convertIn(srcItem);
      // Driver 4 removed `result.ops`, which used to carry the stored
      // document. The generated id comes back on its own instead.
      const result = await collection.insertOne(item);
      return this.convertOut({ ...item, [idField]: result.insertedId });
    });
  }

  async insertMany(name, srcItems): Promise<any> {
    return this.executeInCollection(name, async (collection) => {
      const items = this.convertIn(srcItems);
      const result = await collection.insertMany(items);
      // As with `insertOne`, answer with the stored documents rather than with
      // the driver's own result, which carries only counts and ids.
      return this.convertOut(
        items.map((item, index) => ({
          ...item,
          [idField]: result.insertedIds[index],
        }))
      );
    });
  }

  async save(name?, srcItem?) {
    const item = this.convertIn(srcItem);
    if (!item[idField]) {
      return this.insertOne(name, item);
    }
    const oldItem = await this.findById(name, item[idField]);
    if (oldItem) {
      return this.update(name, item);
    }
    return this.insertOne(name, item);
  }

  async update(name, srcItem) {
    const item = this.convertIn(srcItem);
    const query = { [idField]: new ObjectId(item[idField]) };
    const cloned = { ...item };
    delete cloned[idField];
    delete cloned.id;
    return this.executeInCollection(name, async (collection) => {
      await collection.updateOne(query, { $set: cloned });
      return this.convertOut(item);
    });
  }

  async remove(name, condition: any = {}, justOne = false) {
    return this.executeInCollection(name, async (collection) =>
      justOne
        ? collection.deleteOne(condition)
        : collection.deleteMany(condition)
    );
  }

  async removeById(name, id) {
    let oId;
    try {
      oId = new ObjectId(id);
    } catch {
      return null;
    }
    return this.remove(name, { [idField]: oId }, true);
  }
}

export default MongodbAdapter;
